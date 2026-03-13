import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SafetyReport, TravelAlert } from '../types';
import { ASIAN_CITIES_SAFETY } from '../data/cities';
import { ShieldAlert, Info, MapPin, Search, Crosshair } from 'lucide-react';

// Fix Leaflet icon issue
const icon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  reports: SafetyReport[];
  userLocation: [number, number] | null;
  selectedCountry: string;
  travelAlert: TravelAlert | null;
}

function MapUpdater({ center, zoom }: { center: [number, number] | null, zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, map, zoom]);
  return null;
}

export const SafetyMap: React.FC<Props> = ({ reports, userLocation, selectedCountry, travelAlert }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.0, 110.0]); // Center on Asia
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(4);

  useEffect(() => {
    if (travelAlert?.geography?.center) {
      setMapCenter(travelAlert.geography.center);
      setZoomLevel(5);
    } else if (userLocation) {
      setMapCenter(userLocation);
      setZoomLevel(5);
    }
  }, [travelAlert, userLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setZoomLevel(12);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const goToMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setZoomLevel(14);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case '高': return '#ef4444';
      case '中': return '#f97316';
      default: return '#22c55e';
    }
  };

  return (
    <div className="h-full w-full relative">
      {/* Search Bar Overlay */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className={`absolute left-4 top-4 w-4 h-4 ${isSearching ? 'text-babyblue animate-pulse' : 'text-slate-400'}`} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋地點、城市或國家..."
            className="w-full bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-ink shadow-2xl focus:ring-2 focus:ring-babyblue/20 transition-all placeholder:text-slate-400"
          />
        </form>
        <button 
          onClick={goToMyLocation}
          className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 shadow-2xl text-slate-500 hover:text-babyblue active:scale-90 transition-all"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} zoom={zoomLevel} />
        
        {/* User Location */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>您的位置</Popup>
          </Marker>
        )}

        {/* 40 Asian Cities Safety Data */}
        {ASIAN_CITIES_SAFETY.map((city) => {
          const score = Math.round(city.totalScore);
          let markerColor = '#ef4444'; // < 60 Red
          if (score >= 80) markerColor = '#22c55e'; // 80+ Green
          else if (score >= 60) markerColor = '#f97316'; // 60-80 Orange

          return (
            <Marker 
              key={city.id} 
              position={city.coordinates}
              icon={L.divIcon({
                className: 'custom-city-icon',
                html: `
                  <div style="
                    background-color: white; 
                    width: 42px; 
                    height: 42px; 
                    border-radius: 50%; 
                    border: 3px solid ${markerColor}; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    justify-content: center; 
                    color: ${markerColor}; 
                  ">
                    <span style="font-size: 14px; font-weight: 900; line-height: 1;">${score}</span>
                    <span style="font-size: 6px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Safety</span>
                  </div>
                `,
                iconSize: [42, 42],
                iconAnchor: [21, 21]
              })}
            >
              <Popup>
                <div className="p-3 min-w-[200px] bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-base tracking-tight text-ink">{city.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{city.country}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider`} style={{ backgroundColor: markerColor + '15', color: markerColor, border: `1px solid ${markerColor}30` }}>
                      {city.riskLevel}風險
                    </span>
                    <span className="text-xs font-black text-slate-700">{city.totalScore} 綜合評分</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px]">
                    <DimensionItem label="治安狀況" value={city.dimensions.publicSecurity} />
                    <DimensionItem label="女性安全" value={city.dimensions.womenSafety} />
                    <DimensionItem label="夜間安全" value={city.dimensions.nightSafety} />
                    <DimensionItem label="交通安全" value={city.dimensions.trafficSafety} />
                    <DimensionItem label="醫療資源" value={city.dimensions.medicalResources} />
                    <DimensionItem label="自然災害" value={city.dimensions.naturalDisaster} />
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* User Reports */}
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div style="
                  background-color: ${getRiskColor(report.risk_level)}; 
                  width: 14px; 
                  height: 14px; 
                  border-radius: 50%; 
                  border: 2px solid white; 
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                "></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            })}
          >
            <Popup>
              <div className="p-2 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4" style={{ color: getRiskColor(report.risk_level) }} />
                  <span className="font-black text-xs uppercase tracking-wider text-ink">{report.type}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{report.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

function DimensionItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-slate-400 font-bold uppercase tracking-tighter" style={{ fontSize: '8px' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-babyblue" style={{ width: `${value}%` }} />
        </div>
        <span className="font-black text-slate-700" style={{ fontSize: '9px' }}>{value}</span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-medium text-slate-600">{label}</span>
    </div>
  );
}
