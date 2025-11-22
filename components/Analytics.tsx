
import React, { useState } from 'react';
import { Host, Session } from '../types';
import { analyzePerformance } from '../services/geminiService';
import Button from './Button';
import { Sparkles, Lightbulb, TrendingUp, Calendar, Store, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line } from 'recharts';

interface AnalyticsProps {
  sessions: Session[];
  hosts: Host[];
}

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const Analytics: React.FC<AnalyticsProps> = ({ sessions, hosts }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Account Analysis Data Preparation (Current Month Only) ---
  const DATA_CURRENT_MONTH_START = "2025-11-01";
  const DATA_CURRENT_MONTH_END = "2025-11-30";

  // Filter sessions to only include current month for the account analysis section
  const currentMonthSessions = sessions.filter(s => s.date >= DATA_CURRENT_MONTH_START && s.date <= DATA_CURRENT_MONTH_END);

  const bigAccountSessions = currentMonthSessions.filter(s => s.accountId === 'acc_big');
  const smallAccountSessions = currentMonthSessions.filter(s => s.accountId === 'acc_small');

  const bigAccountStats = {
    name: 'anta_globalstore',
    totalRevenueUSD: bigAccountSessions.reduce((sum, s) => sum + s.revenueUSD, 0),
    totalDuration: bigAccountSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    avgRevenueUSD: bigAccountSessions.length > 0 ? bigAccountSessions.reduce((sum, s) => sum + s.revenueUSD, 0) / bigAccountSessions.length : 0,
    count: bigAccountSessions.length
  };

  const smallAccountStats = {
    name: 'keepmovingofficial',
    totalRevenueUSD: smallAccountSessions.reduce((sum, s) => sum + s.revenueUSD, 0),
    totalDuration: smallAccountSessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    avgRevenueUSD: smallAccountSessions.length > 0 ? smallAccountSessions.reduce((sum, s) => sum + s.revenueUSD, 0) / smallAccountSessions.length : 0,
    count: smallAccountSessions.length
  };

  // Prepare daily comparison data based on current month sessions - using USD for account trend
  const dailyComparisonData = React.useMemo(() => {
    const dateMap = new Map<string, { date: string, bigRev: number, smallRev: number }>();
    
    currentMonthSessions.forEach(s => {
      if (!dateMap.has(s.date)) {
        dateMap.set(s.date, { date: s.date.slice(5), bigRev: 0, smallRev: 0 });
      }
      const entry = dateMap.get(s.date)!;
      if (s.accountId === 'acc_big') {
        entry.bigRev += s.revenueUSD; // Use USD
      } else {
        entry.smallRev += s.revenueUSD; // Use USD
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [currentMonthSessions]);


  // --- Existing Charts Data (Using all sessions for broader context, or could be filtered too) ---
  // Assuming the bottom charts should reflect general analytics, we'll keep using 'sessions' 
  // but updated labels to PHP.
  const revenueByHost = hosts.map(host => {
    const total = sessions
      .filter(s => s.hostId === host.id)
      .reduce((sum, s) => sum + s.revenue, 0);
    return { name: host.name, value: total };
  }).filter(item => item.value > 0);

  const durationRevenueData = sessions.map(s => ({
    name: s.date.slice(5), // Format date to MM-DD
    fullDate: s.date,
    hostName: s.hostName,
    duration: s.durationMinutes,
    revenue: s.revenue
  }));

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const result = await analyzePerformance(sessions, hosts);
    setReport(result);
    setIsGenerating(false);
  };

  // Simple markdown renderer helper
  const SimpleMarkdown = ({ content }: { content: string }) => {
    return (
      <div className="prose prose-indigo max-w-none space-y-4 text-gray-700">
        {content.split('\n').map((line, index) => {
            if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-bold text-gray-900 mt-4">{line.replace('### ', '')}</h3>;
            if (line.startsWith('**')) return <p key={index} className="font-bold">{line.replace(/\*\*/g, '')}</p>;
            if (line.startsWith('- ')) return <li key={index} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
            if (line.startsWith('1. ')) return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
            if (line.trim() === '') return <br key={index} />;
            return <p key={index}>{line}</p>;
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* AI Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center">
              <Sparkles className="w-8 h-8 mr-3 text-yellow-300" />
              AI 智能分析助手
            </h2>
            <p className="text-indigo-100 max-w-xl">
              利用 Gemini AI 深度分析您的直播数据，挖掘营收增长点，获取针对每位主播的优化建议。
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Button 
              onClick={handleGenerateReport} 
              isLoading={isGenerating}
              className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-lg font-bold px-8 py-3 text-lg"
            >
              {report ? '重新生成报告' : '生成分析报告'}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Result Area */}
      {report && (
        <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden animate-fade-in">
           <div className="p-6 border-b border-gray-100 bg-indigo-50/50 flex items-center">
              <Lightbulb className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">分析报告结果</h3>
           </div>
           <div className="p-8 bg-white">
             <SimpleMarkdown content={report} />
           </div>
        </div>
      )}

      {/* --- New Section: Account Comparison Analysis --- */}
      <div>
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center">
             <Store className="w-6 h-6 text-indigo-600 mr-2" />
             <h2 className="text-2xl font-bold text-gray-900">双账号经营分析板 (当月数据)</h2>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">统计周期: {DATA_CURRENT_MONTH_START} 至 {DATA_CURRENT_MONTH_END}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Big Account Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
              <span className="font-bold text-blue-900">大号: anta_globalstore</span>
              <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">核心账号</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">本月总营收 (USD)</p>
                <p className="text-2xl font-bold text-blue-600">${bigAccountStats.totalRevenueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-center border-l border-gray-100">
                 <p className="text-sm text-gray-500">本月时长</p>
                 <p className="text-xl font-semibold text-gray-800">{(bigAccountStats.totalDuration / 60).toFixed(1)} h</p>
              </div>
              <div className="text-center border-l border-gray-100">
                 <p className="text-sm text-gray-500">本月场均</p>
                 <p className="text-xl font-semibold text-gray-800">${bigAccountStats.avgRevenueUSD.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Small Account Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
              <span className="font-bold text-orange-900">小号: keepmovingofficial</span>
              <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full">成长账号</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">本月总营收 (USD)</p>
                <p className="text-2xl font-bold text-orange-600">${smallAccountStats.totalRevenueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-center border-l border-gray-100">
                 <p className="text-sm text-gray-500">本月时长</p>
                 <p className="text-xl font-semibold text-gray-800">{(smallAccountStats.totalDuration / 60).toFixed(1)} h</p>
              </div>
              <div className="text-center border-l border-gray-100">
                 <p className="text-sm text-gray-500">本月场均</p>
                 <p className="text-xl font-semibold text-gray-800">${smallAccountStats.avgRevenueUSD.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900 flex items-center">
               <Activity className="w-5 h-5 mr-2 text-indigo-500" />
               本月账号营收趋势对比 (Daily Trend - USD)
             </h3>
           </div>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(v) => `$${(v).toFixed(0)}`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      return [`$${value.toLocaleString()}`, name === 'bigRev' ? 'anta_globalstore' : 'keepmovingofficial'];
                    }}
                  />
                  <Legend 
                    formatter={(value) => value === 'bigRev' ? 'anta_globalstore' : 'keepmovingofficial'}
                  />
                  <Line type="monotone" dataKey="bigRev" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="smallRev" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Share */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900 flex items-center">
               <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
               各主播总营收贡献 (PHP)
             </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByHost}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueByHost.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duration vs Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
               <Calendar className="w-5 h-5 mr-2 text-green-500" />
               时长与营收关系 (PHP)
             </h3>
          </div>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#4f46e5" 
                  tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981" 
                  tickFormatter={(v) => `${v}m`}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                      return `${payload[0].payload.fullDate} (${payload[0].payload.hostName})`;
                    }
                    return label;
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === '营收') return `₱${value.toLocaleString()}`;
                    return value;
                  }} 
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="营收" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="duration" name="时长 (分)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
