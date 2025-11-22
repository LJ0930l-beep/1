
import React, { useState } from 'react';
import { Host, Session } from '../types';
import Button from './Button';
import { Save, X } from 'lucide-react';

interface SessionLoggerProps {
  hosts: Host[];
  onSave: (session: Session) => void;
  onCancel: () => void;
}

const ACCOUNTS = [
  { id: 'acc_big', name: 'anta_globalstore' },
  { id: 'acc_small', name: 'keepmovingofficial' }
];

const SessionLogger: React.FC<SessionLoggerProps> = ({ hosts, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    hostId: '',
    accountId: 'acc_big',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    durationMinutes: 120,
    revenue: 0,
    views: 0
  });

  const activeHosts = hosts.filter(h => h.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const host = hosts.find(h => h.id === formData.hostId);
    if (!host) return;

    const account = ACCOUNTS.find(a => a.id === formData.accountId) || ACCOUNTS[0];
    const revenuePHP = Number(formData.revenue);

    const newSession: Session = {
      id: `s${Date.now()}`, // Simple ID generation
      hostId: formData.hostId,
      hostName: host.name,
      accountId: account.id,
      accountName: account.name,
      date: formData.date,
      startTime: formData.startTime,
      durationMinutes: Number(formData.durationMinutes),
      revenue: revenuePHP,
      revenueUSD: revenuePHP / 58.5, // Approximate conversion if not provided
      views: Number(formData.views)
    };

    onSave(newSession);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">录入直播数据</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
             {/* Account Selection */}
             <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">所属店铺/账号</label>
              <select 
                name="accountId"
                required
                value={formData.accountId} 
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {ACCOUNTS.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Host Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">选择主播</label>
              <select 
                name="hostId"
                required
                value={formData.hostId} 
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">请选择主播...</option>
                {activeHosts.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">直播日期</label>
              <input 
                type="date" 
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <input 
                type="time" 
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">直播时长 (分钟)</label>
              <input 
                type="number" 
                name="durationMinutes"
                required
                min="1"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">总观看人次 (PV)</label>
              <input 
                type="number" 
                name="views"
                required
                min="0"
                value={formData.views}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">总营收 (PHP) - ₱</label>
              <input 
                type="number" 
                name="revenue"
                required
                min="0"
                step="0.01"
                value={formData.revenue}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold text-indigo-600"
              />
              <p className="text-xs text-gray-400 mt-1">系统将自动按汇率估算美元营收</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
            <Button type="submit" variant="primary">
              <Save className="w-4 h-4 mr-2" />
              保存数据
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SessionLogger;
