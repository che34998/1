import React from 'react';
import { SafetyReport } from '../types';
import { ShieldAlert, Clock, MapPin, Trash2, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { motion } from 'motion/react';

interface Props {
  reports: SafetyReport[];
  onNewReport: () => void;
  onDeleteReport: (id: number) => void;
  userEmail: string;
}

export const CommunityFeed: React.FC<Props> = ({ reports, onNewReport, onDeleteReport, userEmail }) => {
  const getRiskStyles = (level: string) => {
    switch (level) {
      case '高': return 'bg-red-50 text-red-600 border-red-100';
      case '中': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-6 py-6 bg-white border-b border-slate-50 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-black text-ink tracking-tight">社群回報</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">即時安全動態</p>
        </div>
        <button 
          onClick={onNewReport}
          className="bg-babyblue text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-babyblue/20 active:scale-95 transition-all hover:bg-babyblue/90"
        >
          <Plus className="w-4 h-4" />
          發佈回報
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="font-black text-slate-400 mb-2 text-lg tracking-tight">目前尚無警報</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-bold">該地區目前看起來很安全。<br />如果您發現任何異常，請隨時回報。</p>
          </div>
        ) : (
          reports.map((report, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={report.id} 
              className="bg-white rounded-3xl p-5 border border-slate-50 relative group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getRiskStyles(report.risk_level)}`}>
                    {report.risk_level}風險
                  </div>
                  <span className="text-xs font-black text-slate-700">{report.type}</span>
                </div>
                {(report.user_email === userEmail || report.can_delete) && (
                  <button 
                    onClick={() => onDeleteReport(report.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5 font-medium">
                {report.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <MapPin className="w-3 h-3" />
                    {report.location_name || '未知地點'}
                  </div>
                  {report.user_email !== 'system@aegisgo.ai' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true, locale: zhTW })}
                    </div>
                  )}
                </div>
                <div className={`text-[10px] font-black italic tracking-tight ${report.user_email === 'system@aegisgo.ai' ? 'text-babyblue' : 'text-slate-400'}`}>
                  {report.user_email === 'system@aegisgo.ai' ? 'AI 智能生成' : '社群成員回報'}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
