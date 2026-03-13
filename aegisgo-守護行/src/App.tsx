import React, { useState, useEffect } from 'react';
import { Map as MapIcon, LayoutList, ShieldAlert, User, Bell, Search, Crosshair } from 'lucide-react';
import { SafetyMap } from './components/SafetyMap';
import { CommunityFeed } from './components/CommunityFeed';
import { SafetyAssistance } from './components/SafetyAssistance';
import { ReportModal } from './components/ReportModal';
import { SafetyReport, ViewMode, TravelAlert } from './types';
import { getTravelAlert } from './services/travelService';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [direction, setDirection] = useState(0);

  const viewOrder: ViewMode[] = ['map', 'feed', 'assistance'];

  const handleViewChange = (newMode: ViewMode) => {
    const currentIndex = viewOrder.indexOf(viewMode);
    const newIndex = viewOrder.indexOf(newMode);
    if (currentIndex !== newIndex) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setViewMode(newMode);
    }
  };

  const pageVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : direction < 0 ? '100%' : 0,
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [dismissedAiReportIds, setDismissedAiReportIds] = useState<number[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [countryCode, setCountryCode] = useState<string>('DEFAULT');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [travelAlert, setTravelAlert] = useState<TravelAlert | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const countries = [
    { code: 'TW', name: '台灣' },
    { code: 'JP', name: '日本' },
    { code: 'KR', name: '韓國' },
    { code: 'CN', name: '中國' },
    { code: 'HK', name: '香港' },
    { code: 'MO', name: '澳門' },
    { code: 'TH', name: '泰國' },
    { code: 'SG', name: '新加坡' },
    { code: 'MY', name: '馬來西亞' },
    { code: 'ID', name: '印尼' },
    { code: 'VN', name: '越南' },
    { code: 'PH', name: '菲律賓' },
    { code: 'IN', name: '印度' },
    { code: 'NP', name: '尼泊爾' },
    { code: 'LK', name: '斯里蘭卡' },
    { code: 'KH', name: '柬埔寨' },
    { code: 'MM', name: '緬甸' },
  ];

  const filteredReports = reports.filter(report => {
    if (selectedCountry) {
      const matchesCountry = report.location_name?.toLowerCase().includes(selectedCountry.toLowerCase());
      if (!matchesCountry) return false;
    }
    if (dismissedAiReportIds.includes(report.id)) return false;
    return true;
  });

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const detectCountry = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=3`);
      const data = await res.json();
      if (data.address && data.address.country_code) {
        const code = data.address.country_code.toUpperCase();
        setCountryCode(code);
        const countryName = data.address.country || code;
        setSelectedCountry(countryName);
        const alert = await getTravelAlert(countryName);
        setTravelAlert(alert);
      }
    } catch (err) {
      console.error('Failed to detect country:', err);
    }
  };

  useEffect(() => {
    fetchReports();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          detectCountry(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          const defaultLoc: [number, number] = [23.6978, 120.9605]; // Taiwan
          setUserLocation(defaultLoc);
          detectCountry(defaultLoc[0], defaultLoc[1]);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (travelAlert?.community_feed) {
      const aiReports: SafetyReport[] = travelAlert.community_feed.map(item => ({
        id: 10000 + parseInt(item.id) || Math.random() * 100000,
        type: 'AI 警示',
        description: item.content,
        risk_level: travelAlert.risk_assessment.level,
        timestamp: item.timestamp,
        user_email: 'system@aegisgo.ai',
        location_name: travelAlert.selected_country,
        can_delete: item.can_delete,
        latitude: travelAlert.geography?.center[0] || 0,
        longitude: travelAlert.geography?.center[1] || 0
      }));
      
      setReports(prev => {
        const filteredPrev = prev.filter(r => r.user_email !== 'system@aegisgo.ai');
        return [...aiReports, ...filteredPrev];
      });
    }
  }, [travelAlert]);

  const handleCountryChange = async (countryName: string) => {
    setSelectedCountry(countryName);
    if (countryName) {
      const country = countries.find(c => c.name === countryName);
      if (country) setCountryCode(country.code);
      setIsLoading(true);
      const alert = await getTravelAlert(countryName);
      setTravelAlert(alert);
      setIsLoading(false);
    } else {
      setCountryCode('DEFAULT');
      setTravelAlert(null);
    }
  };

  const handleNewReport = async (reportData: any) => {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportData,
          user_email: 'user@example.com'
        }),
      });
      setIsReportModalOpen(false);
      fetchReports();
      setViewMode('feed');
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (id >= 10000) {
      setDismissedAiReportIds(prev => [...prev, id]);
      return;
    }

    try {
      await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      fetchReports();
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden md:border-x md:border-slate-100">
      {/* Header */}
      <header className="px-6 py-5 bg-white border-b border-slate-50 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-babyblue p-1.5 rounded-xl shadow-lg shadow-babyblue/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-ink">Aegisgo</h1>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="text-[10px] font-bold border-none bg-slate-50 rounded-full px-3 py-1.5 focus:ring-0 text-slate-600"
          >
            <option value="">選擇國家</option>
            {countries.map(c => (
              <option key={c.code} value={c.name}>{c.name}</option>
            ))}
          </select>
          <button className="relative p-2 text-slate-400 hover:text-ink transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-babyblue rounded-full border-2 border-white" />
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-slate-50">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={viewMode}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full w-full absolute inset-0"
          >
            {viewMode === 'map' && (
              <SafetyMap 
                reports={filteredReports} 
                userLocation={userLocation} 
                selectedCountry={selectedCountry} 
                travelAlert={travelAlert}
              />
            )}
            {viewMode === 'feed' && (
              <CommunityFeed 
                reports={filteredReports} 
                onNewReport={() => setIsReportModalOpen(true)} 
                onDeleteReport={handleDeleteReport}
                userEmail="user@example.com"
              />
            )}
            {viewMode === 'assistance' && (
              <SafetyAssistance countryCode={countryCode} travelAlert={travelAlert} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="bg-white border-t border-slate-50 px-6 py-5 flex items-center justify-around z-20">
        <NavButton 
          active={viewMode === 'map'} 
          onClick={() => handleViewChange('map')} 
          icon={<MapIcon className="w-6 h-6" />} 
          label="地圖" 
        />
        <NavButton 
          active={viewMode === 'feed'} 
          onClick={() => handleViewChange('feed')} 
          icon={<LayoutList className="w-6 h-6" />} 
          label="社群" 
        />
        <NavButton 
          active={viewMode === 'assistance'} 
          onClick={() => handleViewChange('assistance')} 
          icon={<ShieldAlert className="w-6 h-6" />} 
          label="助手" 
        />
      </nav>

      {/* Floating Action Button for Map */}
      {viewMode === 'map' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsReportModalOpen(true)}
          className="absolute bottom-28 right-6 z-30 bg-babyblue text-white p-4 rounded-2xl shadow-2xl shadow-babyblue/40 hover:bg-babyblue/90 transition-all active:scale-95"
        >
          <ShieldAlert className="w-6 h-6" />
        </motion.button>
      )}

      {/* Modals */}
      {isReportModalOpen && (
        <ReportModal 
          onClose={() => setIsReportModalOpen(false)} 
          onSubmit={handleNewReport}
          userLocation={userLocation}
          selectedCountry={selectedCountry}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[3000] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-14 h-14 border-4 border-babyblue border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-slate-500 font-bold animate-pulse tracking-tight">Aegisgo 正在分析安全數據...</p>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-babyblue scale-110' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="nav-indicator" className="w-1.5 h-1.5 bg-babyblue rounded-full mt-0.5 shadow-[0_0_10px_rgba(137,207,240,0.8)]" />}
    </button>
  );
}
