const englishText = {
  appName: "NagarSeva",
  appSlogan: "Civic Issue Reporting & Resolution Tracking Portal",
  navCitizen: "Report Issue",
  navDashboard: "Public Dashboard",
  navAdmin: "Admin Console",
  navPrivacy: "Privacy Policy (DPDP)",
  
  // Auth & User Roles
  login: "Log In",
  signup: "Sign Up",
  logout: "Log Out",
  email: "Email Address",
  password: "Password",
  fullName: "Full Name",
  role: "User Role",
  adminWard: "Assigned Municipal Ward",
  citizen: "Citizen",
  admin: "Municipal Admin",
  
  // Citizen Report Form
  reportTitle: "Report a Civic Issue",
  reportSubtitle: "File infrastructure, sanitation, encroachment, or safety complaints directly to municipal authorities.",
  issueTitleLabel: "Issue Title",
  issueTitlePlaceholder: "e.g., Waterlogging in Lane 4, Pothole on Main Road",
  issueDescLabel: "Detailed Description",
  issueDescPlaceholder: "Describe the issue, landmarks, and approximate severity.",
  categoryLabel: "Category",
  selectCategory: "Select a Category",
  categorySanitation: "Sanitation & Waste Management",
  categoryPothole: "Roads & Potholes",
  categoryEncroachment: "Encroachment & Parking",
  categorySafety: "Public Safety & Streetlights",
  locationLabel: "Geo-Tag Location (Click on the Map)",
  photoLabel: "Upload Photo of the Issue",
  anonymousLabel: "Report Anonymously (DPDP Compliance Option)",
  anonymousHelp: "If selected, your personal details (name/email) will not be stored in our database. Only the issue details, location, and photo will be logged.",
  consentNoticeTitle: "DPDP Act 2023 Consent Notice",
  consentNoticeBody: "By submitting this form, you consent to NagarSeva collecting your location data, description of the issue, and photo for the sole purpose of civic issue resolution. If you are logged in and did not select 'Report Anonymously', your profile ID will be associated with this report to allow tracking. You can request deletion of this data at any time.",
  consentCheckbox: "I agree to the terms and consent to my data being processed for complaint resolution.",
  submitReport: "Submit Complaint",
  submitting: "Submitting...",
  successTitle: "Complaint Logged Successfully!",
  successTrackingId: "Your Tracking ID is:",
  saveTrackingIdMsg: "Please write down or screenshot this tracking ID to monitor resolution status.",
  reportAnother: "Report Another Issue",
  
  // Tracking
  trackHeading: "Track a Complaint",
  trackPlaceholder: "Enter Tracking ID (e.g., NS-123456)",
  trackBtn: "Track Status",
  notFound: "No complaint found with this ID.",
  
  // Statuses
  statusPending: "Pending",
  statusInProgress: "In Progress",
  statusResolved: "Resolved",
  statusEscalated: "Escalated",
  
  // Public Dashboard
  dashTitle: "Civic Resolution Performance Dashboard",
  dashSubtitle: "Live tracking of complaints, resolution rates, and municipal responsiveness across city wards.",
  statTotal: "Total Complaints Logged",
  statResolved: "Resolved Issues",
  statActive: "Active (In Progress)",
  statPending: "Unassigned / Pending",
  statSlaCompliance: "SLA Compliance Rate",
  wardPerformance: "Ward-wise Resolution Performance",
  wardName: "Ward Name",
  wardResolved: "Resolved",
  wardActive: "Active / Escalated",
  wardAvgTime: "Avg. Resolution Time",
  liveMapTitle: "Live Map of Open Issues",
  liveMapSubtitle: "Visualizing civic issues by status. Red: Pending | Orange: In Progress | Green: Resolved",
  recentReports: "Recent Reports",
  
  // Admin View
  adminTitle: "Municipal Administrator Portal",
  adminSubtitle: "Manage complaints, update status, and upload resolution proof for your assigned ward.",
  allWards: "All Wards",
  allCategories: "All Categories",
  slaDeadline: "SLA Deadline",
  slaOverdue: "Breached / Overdue",
  slaEscalationTitle: "SLA Automated Escalation Status",
  daysLeft: "days left",
  hoursLeft: "hours left",
  overdueBy: "Overdue by",
  updateStatusBtn: "Update Status",
  uploadProofLabel: "Upload Closure Proof (Photo after Resolution)",
  resolutionNotesLabel: "Resolution Notes / Closure Remarks",
  closeComplaintBtn: "Close Complaint & Submit Proof",
  escalateBtn: "Force Escalation",
  proofPreview: "Proof Preview",
  uploadedProof: "Uploaded Proof",
  
  // DPDP Settings / Privacy Page
  privacyHeading: "DPDP Act 2023 & Privacy Center",
  privacyText: "Under India's Digital Personal Data Protection Act (DPDP) 2023, you have total control over your digital personal data. Here, you can review our data policies, submit requests to withdraw consent, or request complete deletion of your personal data.",
  privacyPrinciplesTitle: "Our Privacy Principles",
  privacyPrinciple1: "1. Right to Information: We explain clearly what data is collected (photos, description, optional ID, ward location).",
  privacyPrinciple2: "2. Purpose Limitation: The data is ONLY used for resolving the reported civic complaint.",
  privacyPrinciple3: "3. Consent Withdrawal: You can delete your reports and profile, which completely erases your personal records from our system.",
  privacyPrinciple4: "4. Data Minimization: We support anonymous submission so citizens can report safety/civic problems without sharing any PII.",
  requestDataDeletion: "Request Complete Data Deletion",
  dataDeletedSuccess: "All your personal reports and profile data have been permanently erased.",
  confirmDeleteAccount: "Are you sure you want to permanently withdraw consent and delete your account?",
  deleteAccountBtn: "Permanently Delete My Data"
};

export const translations = {
  en: englishText,
  hi: englishText // Make both languages resolve to the English dictionary
};

export type Language = 'en' | 'hi';
export type typeofTranslations = typeof translations.en;
