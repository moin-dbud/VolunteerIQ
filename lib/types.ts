// Shared TypeScript types matching Firestore schema

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'coordinator' | 'volunteer';
  phone?: string;
  location?: string;
  organization?: string;
  bio?: string;
  skills?: string[];
  availabilityStatus?: 'available' | 'busy' | 'offline';
  preferredMissionTypes?: string[];
  maxDistance?: string;
  hoursPerWeek?: string;
  notificationPrefs?: {
    newIssue: boolean;
    urgentAlert: boolean;
    volunteerAssignment: boolean;
    dailySummary: boolean;
  };
  dashboardPrefs?: {
    defaultMapCity: string;
    issuesPerPage: number;
    autoRefresh: boolean;
    showCompleted: boolean;
  };
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Issue {
  issueId?: string;
  title: string;
  category: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  urgency: 'low' | 'medium' | 'high';
  description: string;
  status: 'pending' | 'assigned' | 'completed';
  reportedBy: string;
  assignedTo?: string | null;
  suggestedCategory?: string;
  suggestedPriority?: string;
  priorityReason?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Broadcast {
  broadcastId?: string;
  message: string;
  sentBy: string;
  sentAt: Date | string;
}

export interface GeminiTriageResponse {
  suggestedCategory: string;
  suggestedPriority: string;
  priorityReason: string;
}

export interface GeminiInsightsResponse {
  bestVolunteerMatchUid: string;
  bestVolunteerMatchName: string;
  bestVolunteerMatchSkill: string;
  forecastText: string;
  sentimentText: string;
  satisfactionScore: number;
}

// ─── 12 Skills (4 default visible, 8 under "View All") ────────────────────────
export const SKILL_OPTIONS: { id: string; label: string; icon: string; emoji: string }[] = [
  // Default visible (4)
  { id: 'medical',       label: 'Medical Response',           icon: 'Stethoscope',   emoji: '🏥' },
  { id: 'logistics',     label: 'Logistics & Supply',         icon: 'Truck',         emoji: '📦' },
  { id: 'teaching',      label: 'Teaching & Mentorship',      icon: 'GraduationCap', emoji: '🎓' },
  { id: 'food',          label: 'Food Preparation',           icon: 'Utensils',      emoji: '🍽️' },
  // Hidden under "View All" (8)
  { id: 'emergency',     label: 'Emergency Response',         icon: 'AlertCircle',   emoji: '🚨' },
  { id: 'mentalhealth',  label: 'Mental Health Support',      icon: 'Heart',         emoji: '💚' },
  { id: 'construction',  label: 'Construction & Repair',      icon: 'Wrench',        emoji: '🔧' },
  { id: 'tech',          label: 'IT & Tech Support',          icon: 'Monitor',       emoji: '💻' },
  { id: 'legal',         label: 'Legal Aid',                  icon: 'Scale',         emoji: '⚖️' },
  { id: 'translation',   label: 'Translation & Interpretation', icon: 'Languages',   emoji: '🌐' },
  { id: 'childcare',     label: 'Childcare',                  icon: 'Baby',          emoji: '👶' },
  { id: 'eldercare',     label: 'Elder Care',                 icon: 'Heart',         emoji: '🤝' },
];

export const CATEGORY_OPTIONS = [
  'Infrastructure',
  'Environment',
  'Public Safety',
  'Health & Welfare',
  'Emergency Response',
  'Other',
];

export const URGENCY_COLORS: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#6366f1',
  urgent: '#dc2626',
};

export const STATUS_LABELS: Record<string, string> = {
  pending:   'PENDING',
  assigned:  'ASSIGNED',
  completed: 'COMPLETED',
};

export function getCategoryEmoji(category: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('health') || c.includes('medical')) return '🏥';
  if (c.includes('food'))                            return '🍽️';
  if (c.includes('shelter') || c.includes('infra')) return '🏠';
  if (c.includes('safety'))                          return '🚔';
  if (c.includes('emergency'))                       return '🚨';
  if (c.includes('env'))                             return '🌿';
  return '📍';
}
