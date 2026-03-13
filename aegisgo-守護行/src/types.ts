export type RiskLevel = '低' | '中' | '高';

export interface SafetyReport {
  id: number;
  type: string;
  description: string;
  risk_level: RiskLevel;
  timestamp: string;
  user_email: string;
  location_name: string;
  latitude: number;
  longitude: number;
  can_delete?: boolean;
}

export type ViewMode = 'map' | 'feed' | 'assistance';

export interface CitySafetyScore {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  dimensions: {
    publicSecurity: number; // 治安狀況
    womenSafety: number;    // 女性安全
    nightSafety: number;    // 夜間安全
    trafficSafety: number;  // 交通安全
    medicalResources: number; // 醫療資源
    naturalDisaster: number;  // 自然災害
  };
  totalScore: number; // 0-100
  riskLevel: RiskLevel;
  status: 'Safe' | 'Warning' | 'Danger';
  color: string;
  markerColor: string;
}

export interface TravelAlert {
  selected_country: string;
  risk_assessment: {
    level: RiskLevel;
    summary: string;
    advice: string[];
  };
  emergency_contacts: {
    police: string;
    ambulance: string;
    fire: string;
    embassy?: string;
  };
  community_feed: {
    id: string;
    content: string;
    timestamp: string;
    can_delete: boolean;
  }[];
  geography?: {
    center: [number, number];
  };
}
