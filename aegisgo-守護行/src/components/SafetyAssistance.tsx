import React from 'react';
import { TravelAlert } from '../types';
import { Phone, ShieldCheck, ShieldAlert, Info, Bell, MapPin, Globe, Heart } from 'lucide-react';

interface Props {
  countryCode: string;
  travelAlert: TravelAlert | null;
}

export const SafetyAssistance: React.FC<Props> = ({ countryCode, travelAlert }) => {
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-6 py-8 bg-white border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-babyblue/10 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-babyblue" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-ink tracking-tight">安全助手</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">即時安全分析與支援</p>
          </div>
        </div>
      </div>

      {/* Safety Alerts Section (Primary) */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-ink tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-babyblue" />
            安全通報
          </h3>
        </div>
        
        <div className="space-y-4">
          {travelAlert?.community_feed && travelAlert.community_feed.length > 0 ? (
            travelAlert.community_feed.map((item) => (
              <AlertCard 
                key={item.id}
                type="資訊" 
                title="安全提醒" 
                time={item.timestamp} 
                description={item.content}
                color="#3b82f6"
              />
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-50 text-center">
              <p className="text-xs text-slate-400 font-bold">目前尚無即時通報</p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="px-6 py-8 pb-12 bg-white border-t border-slate-50">
        <h3 className="text-lg font-black text-ink tracking-tight mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-500" />
          緊急救援電話
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <EmergencyCard label="報警" number={travelAlert?.emergency_contacts.police || '110'} icon={<ShieldAlert className="w-5 h-5" />} color="bg-red-50 text-red-600" />
          <EmergencyCard label="急救" number={travelAlert?.emergency_contacts.ambulance || '119'} icon={<Heart className="w-5 h-5" />} color="bg-orange-50 text-orange-600" />
        </div>
      </div>
    </div>
  );
};

function AlertCard({ type, title, time, description, color }: { type: string; title: string; time: string; description: string; color: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: color + '15', color: color }}>
            {type}
          </span>
          <h4 className="font-black text-sm text-ink">{title}</h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{time}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
      <div className="text-babyblue mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h4 className="font-black text-sm text-ink mb-1">{title}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{desc}</p>
    </div>
  );
}

function EmergencyCard({ label, number, icon, color }: { label: string; number: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`p-5 rounded-3xl flex flex-col items-center justify-center gap-2 border border-transparent hover:border-current transition-all cursor-pointer ${color}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-2xl font-black tracking-tighter">{number}</span>
    </div>
  );
}
