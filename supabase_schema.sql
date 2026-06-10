-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null check (role in ('citizen', 'admin')) default 'citizen',
  ward text,
  created_at timestamptz default now()
);

-- Enable Row Level Security on Profiles
alter table public.profiles enable row level security;

-- Create Reports Table
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  title text not null,
  description text not null,
  category text not null check (category in ('Sanitation', 'Pothole', 'Encroachment', 'Safety')),
  latitude double precision not null,
  longitude double precision not null,
  address text,
  ward text not null,
  city text not null,
  photo_url text,
  status text not null check (status in ('Pending', 'In Progress', 'Resolved', 'Escalated')) default 'Pending',
  sla_deadline timestamptz not null,
  is_anonymous boolean not null default false,
  citizen_id uuid references public.profiles(id) on delete set null,
  consent_given boolean not null check (consent_given = true),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz,
  resolution_proof_url text,
  resolution_notes text
);

-- Enable Row Level Security on Reports
alter table public.reports enable row level security;

-- Create Escalation Logs Table
create table public.escalation_logs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade not null,
  escalated_to text not null,
  escalated_at timestamptz default now(),
  notes text
);

-- Enable Row Level Security on Escalation Logs
alter table public.escalation_logs enable row level security;

-- RLS Policies

-- Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Reports Policies
-- Citizens/Public can view all reports (we will strip PII in client views)
create policy "Anyone can view reports"
  on public.reports for select
  using (true);

-- Anyone can submit a report (consent checkbox required)
create policy "Anyone can insert reports"
  on public.reports for insert
  with check (consent_given = true);

-- Only admins or the original logged-in citizen can update reports
create policy "Authorized users can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    ) or (
      citizen_id = auth.uid()
    )
  );

-- Escalation Logs Policies
create policy "Anyone can view escalation logs"
  on public.escalation_logs for select
  using (true);

create policy "Admins can insert escalation logs"
  on public.escalation_logs for insert
  with check (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- Function to handle profile creation on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, ward)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'citizen'),
    new.raw_user_meta_data->>'ward'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on auth signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
