
import React, { useState, useMemo } from 'react';
import { Session, Host, ViewState } from '../types';
import StatCard from './StatCard';
import { DollarSign, Clock, Users, Award, Calendar, Filter, RefreshCw, Video } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from './Button';

interface DashboardProps {
  sessions: Session[];
  hosts: Host[];
  onNavigate?: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, hosts, onNavigate }) => {
  
  // --- Data Anchors (Simulating "Today" as end of Nov 2025 based on dataset) ---
  const DATA_CURRENT_MONTH_START = "2025-11-01";
  const DATA_CURRENT_MONTH_END = "2025-11-30";
  const DATA_LAST_MONTH_START = "2025-10-01";
  const DATA_LAST_MONTH_END = "2025-10-31";
  
  // State for Custom Filter (Controls Leaderboard & Charts)
  const [startDate, setStartDate] = useState(DATA_CURRENT_MONTH_START);
  const [endDate, setEndDate] = useState(DATA_CURRENT_MONTH_END);

  // --- 1. KPI Section Calculations (Fixed Logic: Current Month & Week) ---
  const monthlySessions = sessions.filter(s => s.date >= DATA_CURRENT_MONTH_START && s.date <= DATA_CURRENT_MONTH_END);
  
  // Calculate "Last 7 Days" based on the latest date in the dataset (2025-11-21 approx)
  // We'll just take the last 7 days relative to the fixed end date for consistency
  const sevenDaysAgoStr = "2025-11-14";
  const weeklySessions = sessions.filter(s => s.date >= sevenDaysAgoStr && s.date <= DATA_CURRENT_MONTH_END);
  
  const totalRevenueMonthUSD = monthlySessions.reduce((sum, s) => sum + s.revenueUSD, 0); // Changed to USD
  const totalRevenueWeek = weeklySessions.reduce((sum, s) => sum + s.revenue, 0); // Kept in PHP
  
  // Total Duration (Current Month) for the stat card
  const totalHoursMonth = monthlySessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60;
  const activeHosts = hosts.filter(h => h.status === 'Active').length;

  // --- 2. Filtered Data for Leaderboard & Charts ---
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.date >= startDate && s.date <= endDate);
  }, [sessions, startDate, endDate]);

  // Host Rankings based on Filtered Data
  const hostRankings = useMemo(() => {
    return hosts.map(host => {
      const hostSessions = filteredSessions.filter(s => s.hostId === host.id);
      const revenue = hostSessions.reduce((sum, s) => sum + s.revenue, 0);
      const duration = hostSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      return { ...host, revenue, duration };
    })
    .filter(h => h.revenue > 0 || h.duration > 0) // Only show active hosts in this period
    .sort((a, b) => b.revenue - a.revenue);
  }, [hosts, filteredSessions]);

  // Chart Data based on Filtered Data
  const chartData = useMemo(() => {
    const dailyStats = filteredSessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = { date, revenue: 0 };
      }
      acc[date].revenue += session.revenue;
      return acc;
    }, {} as Record<string, { date: string, revenue: number }>);

    return Object.keys(dailyStats)
      .sort()
      .map(date => ({
        name: date.slice(5), // MM-DD
        fullDate: date,
        revenue: dailyStats[date].revenue
      }));
  }, [filteredSessions]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row (Fixed Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="本月总营收 (USD)" 
          value={`$${totalRevenueMonthUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={<Calendar className="w-6 h-6" />}
          trend="up"
          change="11月"
          subtext="全月累计 (美元)"
          onClick={() => onNavigate?.(ViewState.ANALYTICS)}
        />
        <StatCard 
          title="近七天营收 (PHP)" 
          value={`₱${totalRevenueWeek.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={<DollarSign className="w-6 h-6" />}
          trend="neutral"
          subtext="周常表现 (比索)"
          onClick={() => onNavigate?.(ViewState.ANALYTICS)}
        />
        <StatCard 
          title="当月直播时长" 
          value={`${totalHoursMonth.toFixed(0)} 小时`} 
          icon={<Clock className="w-6 h-6" />}
          subtext="本月累计"
          onClick={() => onNavigate?.(ViewState.HOSTS)}
        />
        <StatCard 
          title="活跃主播团队" 
          value={activeHosts} 
          icon={<Users className="w-6 h-6" />}
          subtext="查看详情"
          onClick={() => onNavigate?.(ViewState.HOSTS)}
        />
      </div>

      {/* Time Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-gray-700">统计周期:</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => { setStartDate(DATA_CURRENT_MONTH_START); setEndDate(DATA_CURRENT_MONTH_END); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${startDate === DATA_CURRENT_MONTH_START && endDate === DATA_CURRENT_MONTH_END ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              本月 (11月)
            </button>
            <button 
              onClick={() => { setStartDate(DATA_LAST_MONTH_START); setEndDate(DATA_LAST_MONTH_END); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${startDate === DATA_LAST_MONTH_START && endDate === DATA_LAST_MONTH_END ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              上月 (10月)
            </button>
            <button 
              onClick={() => { setStartDate('2025-01-01'); setEndDate('2025-12-31'); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${startDate === '2025-01-01' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              全部
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">自定义:</span>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Host Rankings Table */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              主播业绩排名 (所选周期)
            </h3>
            <span className="text-xs text-gray-500">
              {startDate} 至 {endDate}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">排名</th>
                  <th className="px-6 py-3 font-medium">主播</th>
                  <th className="px-6 py-3 font-medium text-right">营收 (PHP)</th>
                  <th className="px-6 py-3 font-medium text-right">直播时长</th>
                  <th className="px-6 py-3 font-medium text-right">时效 (PHP/h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hostRankings.length > 0 ? (
                  hostRankings.map((host, index) => (
                    <tr key={host.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-400">
                        {index === 0 ? <span className="text-yellow-500">🥇</span> : 
                         index === 1 ? <span className="text-gray-400">🥈</span> :
                         index === 2 ? <span className="text-orange-400">🥉</span> : `#${index + 1}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={host.avatar} alt="" className="w-8 h-8 rounded-full mr-3" />
                          <span className="font-medium text-gray-900">{host.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600">
                        ₱{host.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {(host.duration / 60).toFixed(1)} h
                      </td>
                       <td className="px-6 py-4 text-right text-gray-600">
                        ₱{(host.duration > 0 ? (host.revenue / (host.duration/60)) : 0).toFixed(0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      该时间段内无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filtered Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-1">营收趋势 (PHP)</h3>
          <p className="text-xs text-gray-500 mb-4">{startDate} 至 {endDate}</p>
          
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis tickFormatter={(value) => `₱${value/1000}k`} fontSize={12} />
                <Tooltip 
                  labelFormatter={(label, p) => p[0]?.payload.fullDate || label}
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, '营收']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity List (Showing last 5 regardless of filter to keep it "Recent") */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2 text-gray-400" />
            最新直播场次 (Live)
          </h3>
          <button 
            onClick={() => onNavigate?.(ViewState.ANALYTICS)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            查看全部 &rarr;
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-gray-500 font-medium">日期/时间</th>
                <th scope="col" className="px-6 py-3 text-gray-500 font-medium">主播</th>
                <th scope="col" className="px-6 py-3 text-gray-500 font-medium">时长</th>
                <th scope="col" className="px-6 py-3 text-gray-500 font-medium">营收 (PHP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.slice().reverse().slice(0, 5).map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 text-gray-400 mr-2" />
                      {session.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {session.hostName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{session.durationMinutes} 分钟</td>
                  <td className="px-6 py-4 font-medium text-green-600">₱{session.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
