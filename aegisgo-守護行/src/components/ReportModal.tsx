import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, MapPin, AlertCircle, ChevronDown } from 'lucide-react';
import { RiskLevel } from '../types';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

interface Props {
  onClose: () => void;
  onSubmit: (data: any) => void;
  userLocation: [number, number] | null;
  selectedCountry: string;
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function LocationPicker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number, name?: string) => void, position: [number, number] | null }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
      
      // Reverse geocoding
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        if (data && data.display_name) {
          // Try to get a shorter name if possible
          const name = data.address.road || data.address.suburb || data.address.city || data.display_name.split(',')[0];
          onLocationSelect(lat, lng, name);
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

export const ReportModal: React.FC<Props> = ({ onClose, onSubmit, userLocation, selectedCountry }) => {
  const [type, setType] = useState('治安事件');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('中');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(selectedCountry || '');
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(userLocation);

  const reportTypes = ['治安事件', '交通事故', '自然災害', '抗議活動', '醫療緊急', '詐騙警示', '其他'];
  const riskLevels: RiskLevel[] = ['低', '中', '高'];

  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    setMarkerPos([lat, lng]);
    if (name) {
      setLocationName(name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !markerPos) return;

    onSubmit({
      type,
      risk_level: riskLevel,
      description,
      location_name: locationName,
      latitude: markerPos[0],
      longitude: markerPos[1],
    });
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-100"
      >
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-xl border border-red-100">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-black text-ink tracking-tight">發佈安全回報</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-ink transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Type Selection - Dropdown */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">事件類型</label>
            <div className="relative">
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-5 pr-12 text-sm focus:ring-2 focus:ring-babyblue/20 appearance-none font-bold text-ink transition-all shadow-inner"
              >
                {reportTypes.map(t => (
                  <option key={t} value={t} className="bg-white">{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-4.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">風險程度</label>
            <div className="flex gap-3">
              {riskLevels.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setRiskLevel(l)}
                  className={`flex-1 py-3.5 rounded-2xl text-xs font-black border transition-all ${
                    riskLevel === l 
                      ? l === '高' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' :
                        l === '中' ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' :
                        'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20'
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Precise Positioning Map */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">精確位置 (搜尋或點擊地圖選擇)</label>
            <div className="h-52 rounded-2xl overflow-hidden border border-slate-100 relative shadow-inner">
              {/* Modal Map Search */}
              <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="搜尋地點..."
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const query = (e.target as HTMLInputElement).value;
                        if (!query) return;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                          const data = await res.json();
                          if (data && data.length > 0) {
                            const { lat, lon, display_name } = data[0];
                            const name = display_name.split(',')[0];
                            handleLocationSelect(parseFloat(lat), parseFloat(lon), name);
                          }
                        } catch (err) {
                          console.error('Modal search failed:', err);
                        }
                      }
                    }}
                    className="w-full bg-white/90 backdrop-blur-xl border border-slate-100 rounded-xl py-2.5 pl-4 pr-4 text-xs text-ink shadow-xl focus:ring-2 focus:ring-babyblue/20 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <MapContainer 
                center={markerPos || [20, 110]} 
                zoom={13} 
                className="h-full w-full"
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={markerPos} />
                <LocationPicker 
                  position={markerPos} 
                  onLocationSelect={handleLocationSelect} 
                />
              </MapContainer>
              <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-500 border border-slate-100 shadow-xl">
                經緯度: {markerPos ? `${markerPos[0].toFixed(4)}, ${markerPos[1].toFixed(4)}` : '未選擇'}
              </div>
            </div>
          </div>

          {/* Location Name */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">地點名稱</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="輸入具體地點或街道..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-ink focus:ring-2 focus:ring-babyblue/20 font-bold placeholder:text-slate-300 shadow-inner"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">詳細描述</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="請描述您觀察到的情況..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm text-ink focus:ring-2 focus:ring-babyblue/20 resize-none font-bold placeholder:text-slate-300 shadow-inner"
            />
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-600 leading-relaxed font-bold">
              請確保回報資訊真實準確。您的精確座標將被發佈，以便其他使用者避開風險區域。
            </p>
          </div>

          <button 
            type="submit"
            disabled={!markerPos}
            className="w-full bg-ink text-white py-5 rounded-2xl font-black shadow-2xl active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 uppercase tracking-widest text-sm hover:bg-slate-800"
          >
            提交回報
          </button>
        </form>
      </motion.div>
    </div>
  );
};
