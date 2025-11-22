
import React, { useState, useMemo } from 'react';
import { Host, Session } from '../types';
import { MoreHorizontal, Award, Clock, TrendingUp, Filter } from 'lucide-react';

interface HostsListProps {
  hosts: Host[];
  sessions: Session[];
}

const HostsList: React.FC<HostsListProps> = ({ hosts, sessions }) => {
  // Data Anchors
  const DATA_CURRENT_MONTH_START = "2025-11-01";
  const DATA_CURRENT_MONTH_END = "2025-11-30";

  const [startDate, setStartDate] = useState(DATA_CURRENT_MONTH_START);
  const [endDate, setEndDate] = useState(DATA_CURRENT_MONTH_END);
  
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.date >= startDate && s.date <= endDate);
  }, [sessions, startDate, endDate]);

  const getHostStats = (hostId: string) => {
    const hostSessions = filteredSessions.filter(s => s.hostId === hostId);
    const totalRevenue = hostSessions.reduce((sum, s) => sum + s.revenue, 0);
    const totalTime = hostSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const avgRevenue = hostSessions.length > 0 ? totalRevenue / hostSessions.length : 0;
    const hourlyRate = totalTime > 0 ? totalRevenue / (totalTime/60) : 0;
    
    return { totalRevenue, totalTime, avgRevenue, hourlyRate, count: hostSessions.length };
  };

  // Sort hosts by revenue based on the filtered period
  const sortedHosts = [...hosts].sort((a, b) => {
    return getHostStats(b.id).totalRevenue - getHostStats(a.id).totalRevenue;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">主播团队业绩</h2>
          <p className="text-sm text-gray-500 mt-1">
            统计周期: {startDate} 至 {endDate}
          </p>
        </div>
        
        <div className="flex items-center bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
          <button 
            onClick={() => { setStartDate(DATA_CURRENT_MONTH_START); setEndDate(DATA_CURRENT_MONTH_END); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${startDate === DATA_CURRENT_MONTH_START && endDate === DATA_CURRENT_MONTH_END ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            本月 (11月)
          </button>
          <button 
             onClick={() => { setStartDate('2025-10-01'); setEndDate('2025-10-31'); }}
             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${startDate === '2025-10-01' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            上月 (10月)
          </button>
          <button 
            onClick={() => { setStartDate('2025-01-01'); setEndDate('2025-12-31'); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${startDate === '2025-01-01' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            全部历史
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedHosts.map((host, index) => {
          const stats = getHostStats(host.id);
          return (
            <div key={host.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
              {index < 3 && stats.totalRevenue > 0 && (
                <div className={`absolute top-0 right-0 p-2 rounded-bl-xl text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                  #{index + 1} 营收
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={host.avatar} alt={host.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{host.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                        host.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        host.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {host.status === 'Active' ? '活跃中' : host.status === 'On Leave' ? '休假中' : '已离职'}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">周期场次</p>
                    <p className="mt-1 font-semibold text-gray-900">{stats.count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">周期营收</p>
                    <p className="mt-1 font-bold text-indigo-600">₱{(stats.totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">周期时长</p>
                    <p className="mt-1 font-semibold text-gray-900">{(stats.totalTime/60).toFixed(1)}h</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                   <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-2 text-yellow-500" />
                      <span>场均: ₱{stats.avgRevenue.toFixed(0)}</span>
                   </div>
                   <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                      <span>时效: ₱{stats.hourlyRate.toFixed(0)}/小时</span>
                   </div>
                   <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      <span>入职: {host.joinDate}</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HostsList;