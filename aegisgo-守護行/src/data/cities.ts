import { CitySafetyScore, RiskLevel } from '../types';

const calculateSafety = (
  id: string, 
  name: string, 
  country: string, 
  coords: [number, number], 
  dims: { publicSecurity: number; womenSafety: number; nightSafety: number; trafficSafety: number; medicalResources: number; naturalDisaster: number }
): CitySafetyScore => {
  const totalScore = (dims.publicSecurity + dims.womenSafety + dims.nightSafety + dims.trafficSafety + dims.medicalResources + dims.naturalDisaster) / 6;
  
  let riskLevel: RiskLevel = '低';
  let status: 'Safe' | 'Warning' | 'Danger' = 'Safe';
  let color = '#D1FAE5';
  let markerColor = '#10B981';

  if (totalScore < 60) {
    riskLevel = '高';
    status = 'Danger';
    color = '#FEE2E2';
    markerColor = '#EF4444';
  } else if (totalScore <= 80) {
    riskLevel = '中';
    status = 'Warning';
    color = '#FEF3C7';
    markerColor = '#F59E0B';
  }

  return {
    id, name, country, coordinates: coords,
    dimensions: dims,
    totalScore: Math.round(totalScore * 10) / 10,
    riskLevel, status, color, markerColor
  };
};

export const ASIAN_CITIES_SAFETY: CitySafetyScore[] = [
  // 日本
  calculateSafety('tokyo', '東京', '日本', [35.6762, 139.6503], { publicSecurity: 95, womenSafety: 92, nightSafety: 94, trafficSafety: 88, medicalResources: 96, naturalDisaster: 75 }),
  calculateSafety('osaka', '大阪', '日本', [34.6937, 135.5023], { publicSecurity: 92, womenSafety: 90, nightSafety: 91, trafficSafety: 85, medicalResources: 94, naturalDisaster: 72 }),
  calculateSafety('kyoto', '京都', '日本', [35.0116, 135.7681], { publicSecurity: 96, womenSafety: 94, nightSafety: 95, trafficSafety: 90, medicalResources: 92, naturalDisaster: 70 }),
  calculateSafety('nagoya', '名古屋', '日本', [35.1815, 136.9066], { publicSecurity: 93, womenSafety: 91, nightSafety: 92, trafficSafety: 86, medicalResources: 93, naturalDisaster: 73 }),
  calculateSafety('fukuoka', '福岡', '日本', [33.5904, 130.4017], { publicSecurity: 94, womenSafety: 92, nightSafety: 93, trafficSafety: 87, medicalResources: 92, naturalDisaster: 74 }),
  
  // 韓國
  calculateSafety('seoul', '首爾', '韓國', [37.5665, 126.9780], { publicSecurity: 94, womenSafety: 93, nightSafety: 96, trafficSafety: 82, medicalResources: 95, naturalDisaster: 85 }),
  calculateSafety('busan', '釜山', '韓國', [35.1796, 129.0756], { publicSecurity: 92, womenSafety: 91, nightSafety: 93, trafficSafety: 80, medicalResources: 93, naturalDisaster: 82 }),
  calculateSafety('jeju', '濟州島', '韓國', [33.4996, 126.5312], { publicSecurity: 97, womenSafety: 96, nightSafety: 95, trafficSafety: 88, medicalResources: 90, naturalDisaster: 80 }),
  
  // 台灣
  calculateSafety('taipei', '臺北', '台灣', [25.0330, 121.5654], { publicSecurity: 93, womenSafety: 92, nightSafety: 94, trafficSafety: 78, medicalResources: 95, naturalDisaster: 70 }),
  calculateSafety('kaohsiung', '高雄', '台灣', [22.6273, 120.3014], { publicSecurity: 91, womenSafety: 90, nightSafety: 92, trafficSafety: 75, medicalResources: 93, naturalDisaster: 68 }),
  calculateSafety('taichung', '台中', '台灣', [24.1477, 120.6736], { publicSecurity: 90, womenSafety: 89, nightSafety: 91, trafficSafety: 76, medicalResources: 92, naturalDisaster: 69 }),
  
  // 港澳
  calculateSafety('hongkong', '香港', '香港', [22.3193, 114.1694], { publicSecurity: 92, womenSafety: 91, nightSafety: 93, trafficSafety: 94, medicalResources: 95, naturalDisaster: 82 }),
  calculateSafety('macau', '澳門', '澳門', [22.1987, 113.5439], { publicSecurity: 94, womenSafety: 93, nightSafety: 95, trafficSafety: 92, medicalResources: 90, naturalDisaster: 80 }),
  
  // 中國
  calculateSafety('beijing', '北京', '中國', [39.9042, 116.4074], { publicSecurity: 95, womenSafety: 90, nightSafety: 92, trafficSafety: 75, medicalResources: 88, naturalDisaster: 85 }),
  calculateSafety('shanghai', '上海', '中國', [31.2304, 121.4737], { publicSecurity: 94, womenSafety: 91, nightSafety: 93, trafficSafety: 78, medicalResources: 92, naturalDisaster: 82 }),
  calculateSafety('guangzhou', '廣州', '中國', [23.1291, 113.2644], { publicSecurity: 88, womenSafety: 85, nightSafety: 86, trafficSafety: 72, medicalResources: 85, naturalDisaster: 80 }),
  calculateSafety('shenzhen', '深圳', '中國', [22.5431, 114.0579], { publicSecurity: 92, womenSafety: 88, nightSafety: 90, trafficSafety: 76, medicalResources: 86, naturalDisaster: 82 }),
  calculateSafety('xian', '西安', '中國', [34.3416, 108.9398], { publicSecurity: 85, womenSafety: 82, nightSafety: 80, trafficSafety: 70, medicalResources: 75, naturalDisaster: 80 }),
  
  // 東南亞
  calculateSafety('bangkok', '曼谷', '泰國', [13.7563, 100.5018], { publicSecurity: 65, womenSafety: 62, nightSafety: 60, trafficSafety: 45, medicalResources: 82, naturalDisaster: 75 }),
  calculateSafety('chiangmai', '清邁', '泰國', [18.7883, 98.9853], { publicSecurity: 78, womenSafety: 75, nightSafety: 76, trafficSafety: 60, medicalResources: 72, naturalDisaster: 80 }),
  calculateSafety('phuket', '普吉島', '泰國', [7.8804, 98.3923], { publicSecurity: 62, womenSafety: 60, nightSafety: 58, trafficSafety: 40, medicalResources: 65, naturalDisaster: 70 }),
  calculateSafety('singapore', '新加坡', '新加坡', [1.3521, 103.8198], { publicSecurity: 98, womenSafety: 97, nightSafety: 99, trafficSafety: 96, medicalResources: 98, naturalDisaster: 95 }),
  calculateSafety('kualalumpur', '吉隆坡', '馬來西亞', [3.1390, 101.6869], { publicSecurity: 68, womenSafety: 65, nightSafety: 62, trafficSafety: 55, medicalResources: 80, naturalDisaster: 82 }),
  calculateSafety('penang', '檳城', '馬來西亞', [5.4141, 100.3288], { publicSecurity: 75, womenSafety: 72, nightSafety: 70, trafficSafety: 62, medicalResources: 75, naturalDisaster: 80 }),
  calculateSafety('jakarta', '雅加達', '印尼', [-6.2088, 106.8456], { publicSecurity: 55, womenSafety: 50, nightSafety: 48, trafficSafety: 30, medicalResources: 65, naturalDisaster: 55 }),
  calculateSafety('bali', '峇里島', '印尼', [-8.3405, 115.0920], { publicSecurity: 65, womenSafety: 62, nightSafety: 60, trafficSafety: 45, medicalResources: 55, naturalDisaster: 60 }),
  calculateSafety('surabaya', '泗水', '印尼', [-7.2575, 112.7521], { publicSecurity: 60, womenSafety: 58, nightSafety: 55, trafficSafety: 40, medicalResources: 58, naturalDisaster: 55 }),
  calculateSafety('hanoi', '河內', '越南', [21.0285, 105.8542], { publicSecurity: 78, womenSafety: 75, nightSafety: 76, trafficSafety: 55, medicalResources: 68, naturalDisaster: 72 }),
  calculateSafety('hochiminh', '胡志明市', '越南', [10.8231, 106.6297], { publicSecurity: 68, womenSafety: 65, nightSafety: 62, trafficSafety: 48, medicalResources: 70, naturalDisaster: 70 }),
  calculateSafety('halongbay', '下龍灣', '越南', [20.9101, 107.1839], { publicSecurity: 80, womenSafety: 78, nightSafety: 75, trafficSafety: 60, medicalResources: 62, naturalDisaster: 75 }),
  calculateSafety('phnompenh', '金邊', '柬埔寨', [11.5564, 104.9282], { publicSecurity: 52, womenSafety: 48, nightSafety: 45, trafficSafety: 42, medicalResources: 45, naturalDisaster: 65 }),
  calculateSafety('siemreap', '吳哥窟／暹粒', '柬埔寨', [13.3671, 103.8448], { publicSecurity: 65, womenSafety: 62, nightSafety: 60, trafficSafety: 55, medicalResources: 48, naturalDisaster: 68 }),
  calculateSafety('yangon', '仰光', '緬甸', [16.8661, 96.1951], { publicSecurity: 35, womenSafety: 32, nightSafety: 30, trafficSafety: 45, medicalResources: 38, naturalDisaster: 65 }),
  calculateSafety('mandalay', '曼德勒', '緬甸', [21.9588, 96.0891], { publicSecurity: 38, womenSafety: 35, nightSafety: 32, trafficSafety: 48, medicalResources: 40, naturalDisaster: 68 }),
  calculateSafety('manila', '馬尼拉', '菲律賓', [14.5995, 120.9842], { publicSecurity: 50, womenSafety: 48, nightSafety: 45, trafficSafety: 35, medicalResources: 62, naturalDisaster: 55 }),
  calculateSafety('cebu', '宿霧', '菲律賓', [10.3157, 123.8854], { publicSecurity: 62, womenSafety: 60, nightSafety: 58, trafficSafety: 45, medicalResources: 55, naturalDisaster: 60 }),
  
  // 南亞
  calculateSafety('delhi', '德里', '印度', [28.6139, 77.2090], { publicSecurity: 45, womenSafety: 35, nightSafety: 38, trafficSafety: 32, medicalResources: 65, naturalDisaster: 75 }),
  calculateSafety('mumbai', '孟買', '印度', [19.0760, 72.8777], { publicSecurity: 58, womenSafety: 52, nightSafety: 55, trafficSafety: 42, medicalResources: 68, naturalDisaster: 72 }),
  calculateSafety('kathmandu', '加德滿都', '尼泊爾', [27.7172, 85.3240], { publicSecurity: 68, womenSafety: 65, nightSafety: 62, trafficSafety: 55, medicalResources: 48, naturalDisaster: 52 }),
  calculateSafety('colombo', '可倫坡', '斯里蘭卡', [6.9271, 79.8612], { publicSecurity: 65, womenSafety: 62, nightSafety: 60, trafficSafety: 58, medicalResources: 55, naturalDisaster: 75 }),
];
