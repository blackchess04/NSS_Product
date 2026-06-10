import { supabase } from './supabaseClient';

export interface Report {
  id: string;
  tracking_id: string;
  title: string;
  description: string;
  category: 'Sanitation' | 'Pothole' | 'Encroachment' | 'Safety';
  latitude: number;
  longitude: number;
  address: string;
  ward: string;
  city: string;
  photo_url?: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';
  sla_deadline: string;
  is_anonymous: boolean;
  citizen_id?: string;
  consent_given: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_proof_url?: string;
  resolution_notes?: string;
}

// Pre-seeded demo reports for a beautiful initial experience
const MOCK_REPORTS: Report[] = [
  {
    id: "m1",
    tracking_id: "NS-729401",
    title: "Overflowing Garbage Dump near Metro Station",
    description: "The primary dustbin is completely overflowing, garbage is spilled onto the road, creating terrible stench and health hazards.",
    category: "Sanitation",
    latitude: 12.9784,
    longitude: 77.6408,
    address: "Metro Pillar 124, near Indiranagar Metro, Indiranagar, Nagar City",
    ward: "Ward 3 - Indiranagar",
    city: "Nagar City",
    photo_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400",
    status: "Pending",
    sla_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days SLA
    is_anonymous: false,
    consent_given: true,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hrs ago
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "m2",
    tracking_id: "NS-184920",
    title: "Dangerous Pothole on Main Crossing",
    description: "Extremely deep pothole right at the intersection. Two bikers fell yesterday. Needs immediate filling before monsoons.",
    category: "Pothole",
    latitude: 12.9800,
    longitude: 77.5800,
    address: "2nd Cross, Subhash Nagar Main Road, Nagar City",
    ward: "Ward 2 - Subhash Nagar",
    city: "Nagar City",
    photo_url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400",
    status: "In Progress",
    sla_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 7 days SLA, 4 days left
    is_anonymous: true,
    consent_given: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "m3",
    tracking_id: "NS-904128",
    title: "Broken Streetlights on Dark Corner Lane",
    description: "The entire stretch of streetlights is broken. Very dark at night, making it unsafe for women and children returning late.",
    category: "Safety",
    latitude: 12.9716,
    longitude: 77.5946,
    address: "Behind Commercial Complex, Gandhi Nagar, Nagar City",
    ward: "Ward 1 - Gandhi Nagar",
    city: "Nagar City",
    photo_url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=400",
    status: "Escalated", // Overdue! Safety SLA is 1 day, created 2 days ago
    sla_deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    is_anonymous: false,
    consent_given: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "m4",
    tracking_id: "NS-403912",
    title: "Encroached Footpath by Construction Debris",
    description: "Building materials dumped on the footpath, forcing pedestrians to walk on the busy road. Blockage is about 50 meters long.",
    category: "Encroachment",
    latitude: 12.9600,
    longitude: 77.6100,
    address: "Metro Residency Lane, Ashok Nagar, Nagar City",
    ward: "Ward 4 - Ashok Nagar",
    city: "Nagar City",
    photo_url: "https://images.unsplash.com/photo-1590088029788-235312786a24?auto=format&fit=crop&q=80&w=400",
    status: "Resolved",
    sla_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 5 days SLA
    is_anonymous: false,
    consent_given: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Resolved 1 day ago
    resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolution_proof_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400", // Cleared road photo
    resolution_notes: "Debris has been successfully cleared by the municipal cleanup crew and warnings issued to the building supervisor.",
  }
];

// Determine SLA Duration in Days
export const getSlaDays = (category: string): number => {
  switch (category) {
    case 'Safety': return 1;
    case 'Sanitation': return 2;
    case 'Encroachment': return 5;
    case 'Pothole': return 7;
    default: return 5;
  }
};

const getLocalStorageReports = (): Report[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('nagarseva_reports');
  if (!stored) {
    localStorage.setItem('nagarseva_reports', JSON.stringify(MOCK_REPORTS));
    return MOCK_REPORTS;
  }
  return JSON.parse(stored);
};

const saveLocalStorageReports = (reports: Report[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nagarseva_reports', JSON.stringify(reports));
};

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('your-supabase-project');
};

// Auto escalate check helper
const checkAndApplyEscalations = (reports: Report[]): { reports: Report[], changed: boolean } => {
  let changed = false;
  const now = new Date();
  const updated = reports.map(r => {
    if (r.status !== 'Resolved' && r.status !== 'Escalated' && new Date(r.sla_deadline) < now) {
      changed = true;
      return {
        ...r,
        status: 'Escalated' as const,
        updated_at: now.toISOString()
      };
    }
    return r;
  });
  return { reports: updated, changed };
};

export const reportsStore = {
  async getAllReports(): Promise<Report[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        
        // Scan for auto-escalations and sync back to db if needed
        const now = new Date();
        const overdueReports = data.filter(
          r => r.status !== 'Resolved' && r.status !== 'Escalated' && new Date(r.sla_deadline) < now
        );

        if (overdueReports.length > 0) {
          for (const rep of overdueReports) {
            await supabase
              .from('reports')
              .update({ status: 'Escalated', updated_at: now.toISOString() })
              .eq('id', rep.id);
            
            // Log escalation
            await supabase
              .from('escalation_logs')
              .insert({
                report_id: rep.id,
                escalated_to: "Ward Commissioner Office",
                notes: `Automated System Escalation: Complaint breached its ${getSlaDays(rep.category)}-day SLA.`
              });
          }
          // Fetch updated list
          const { data: refreshed } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });
          return refreshed || data;
        }

        return data;
      } catch (err) {
        console.warn('Supabase fetch failed. Falling back to localStorage.', err);
      }
    }

    // Local Storage Flow
    const local = getLocalStorageReports();
    const { reports: updated, changed } = checkAndApplyEscalations(local);
    if (changed) {
      saveLocalStorageReports(updated);
    }
    // Sort by created_at descending
    return [...updated].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getReportByTrackingId(trackingId: string): Promise<Report | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('tracking_id', trackingId)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase tracking lookup failed. Querying localStorage.', err);
      }
    }

    const local = getLocalStorageReports();
    const found = local.find(r => r.tracking_id.toLowerCase() === trackingId.toLowerCase());
    if (found) {
      // Check if it should be escalated
      if (found.status !== 'Resolved' && found.status !== 'Escalated' && new Date(found.sla_deadline) < new Date()) {
        found.status = 'Escalated';
        found.updated_at = new Date().toISOString();
        const index = local.findIndex(r => r.id === found.id);
        local[index] = found;
        saveLocalStorageReports(local);
      }
      return found;
    }
    return null;
  },

  async createReport(reportData: Omit<Report, 'id' | 'tracking_id' | 'status' | 'created_at' | 'updated_at'>): Promise<Report> {
    const tracking_id = `NS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    
    const newReport: Report = {
      ...reportData,
      id: Math.random().toString(36).substring(2, 9),
      tracking_id,
      status: 'Pending',
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .insert({
            ...newReport,
            id: undefined // Let Postgres generate UUID
          })
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Supabase report creation failed. Saving locally.', err);
      }
    }

    // Save to LocalStorage
    const local = getLocalStorageReports();
    local.push(newReport);
    saveLocalStorageReports(local);
    return newReport;
  },

  async updateReportStatus(
    id: string,
    status: 'Pending' | 'In Progress' | 'Resolved' | 'Escalated',
    proofUrl?: string,
    notes?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const updates: any = {
          status,
          updated_at: now,
          resolution_proof_url: proofUrl || null,
          resolution_notes: notes || null
        };
        if (status === 'Resolved') {
          updates.resolved_at = now;
        }

        const { error } = await supabase
          .from('reports')
          .update(updates)
          .eq('id', id);

        if (!error) return true;
      } catch (err) {
        console.error('Supabase update status failed. Updating locally.', err);
      }
    }

    // Local Storage Flow
    const local = getLocalStorageReports();
    const index = local.findIndex(r => r.id === id);
    if (index !== -1) {
      local[index] = {
        ...local[index],
        status,
        updated_at: now,
        resolution_proof_url: proofUrl,
        resolution_notes: notes,
        resolved_at: status === 'Resolved' ? now : local[index].resolved_at
      };
      saveLocalStorageReports(local);
      return true;
    }
    return false;
  },

  async deleteReportByTrackingId(trackingId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('tracking_id', trackingId);
        if (!error) return true;
      } catch (err) {
        console.error('Supabase delete failed. Deleting locally.', err);
      }
    }

    // Local Storage Flow
    const local = getLocalStorageReports();
    const filtered = local.filter(r => r.tracking_id.toLowerCase() !== trackingId.toLowerCase());
    if (filtered.length < local.length) {
      saveLocalStorageReports(filtered);
      return true;
    }
    return false;
  }
};
