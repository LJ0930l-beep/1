import React, { useState, useMemo } from 'react';
import { Session, Host } from '../types';
import { Search, Edit2, Trash2, Save, X, AlertCircle } from 'lucide-react';
import Button from './Button';

interface DataCenterProps {
  sessions: Session[];
  hosts: Host[];
  onUpdateSession: (updatedSession: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

const DataCenter: React.FC<DataCenterProps> = ({ sessions, hosts, onUpdateSession, onDeleteSession }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Session>>({});

  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => 
      s.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.date.includes(searchTerm)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Default sort by date desc
  }, [sessions, searchTerm]);

  const handleEditClick = (session: Session) => {
    setEditingId(session.id);
    setEditForm({ ...session });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      // Ensure numeric values are numbers
      const updatedSession = {
        ...editForm,
        revenue: Number(editForm.revenue),
        revenueUSD: Number(editForm.revenueUSD),
        durationMinutes: Number(editForm.durationMinutes),
        views: Number(editForm.views),
      } as Session;

      onUpdateSession(updatedSession);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('确定要删除这条数据吗？此操作不可恢复。')) {
      onDeleteSession(id);
    }
  };

  const handleFormChange = (field: keyof Session, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">数据中心 (Data Center)</h2>
          <p className="text-sm text-gray-500">实时管理数据库，支持编辑与修正</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索日期、主播或店铺..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">店铺/账号</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">主播</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">营收 (PHP)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">营收 (USD)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">时长 (分)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.slice(0, 100).map((session) => (
                <tr key={session.id} className={editingId === session.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
                  
                  {/* Date Field */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === session.id ? (
                      <input 
                        type="date" 
                        value={editForm.date} 
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm p-1"
                      />
                    ) : session.date}
                  </td>

                  {/* Account Field */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {editingId === session.id ? (
                       <select
                         value={editForm.accountId}
                         onChange={(e) => {
                            const accName = e.target.value === 'acc_big' ? 'anta_globalstore' : 'keepmovingofficial';
                            setEditForm(prev => ({ ...prev, accountId: e.target.value, accountName: accName }))
                         }}
                         className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm p-1"
                       >
                         <option value="acc_big">anta_globalstore</option>
                         <option value="acc_small">keepmovingofficial</option>
                       </select>
                     ) : (
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.accountId === 'acc_big' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                         {session.accountName}
                       </span>
                     )}
                  </td>

                  {/* Host Field */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                     {editingId === session.id ? (
                       <select
                         value={editForm.hostId}
                         onChange={(e) => {
                            const host = hosts.find(h => h.id === e.target.value);
                            setEditForm(prev => ({ ...prev, hostId: e.target.value, hostName: host?.name || '' }))
                         }}
                         className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm p-1"
                       >
                         {hosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                       </select>
                     ) : session.hostName}
                  </td>

                  {/* Revenue PHP */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-mono">
                    {editingId === session.id ? (
                      <input 
                        type="number" 
                        value={editForm.revenue} 
                        onChange={(e) => handleFormChange('revenue', e.target.value)}
                        className="w-24 text-right border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm p-1"
                      />
                    ) : `₱${session.revenue.toLocaleString()}`}
                  </td>

                  {/* Revenue USD */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 font-mono">
                    {editingId === session.id ? (
                      <input 
                        type="number" 
                        value={editForm.revenueUSD} 
                        onChange={(e) => handleFormChange('revenueUSD', e.target.value)}
                        className="w-24 text-right border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm p-1"
                      />
                    ) : `$${session.revenueUSD.toLocaleString()}`}
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {editingId === session.id ? (
                      <input 
                        type="number" 
                        value={editForm.durationMinutes} 
                        onChange={(e) => handleFormChange('durationMinutes', e.target.value)}
                        className="w-20 text-right border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm p-1"
                      />
                    ) : `${session.durationMinutes}m`}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === session.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => handleEditClick(session)} className="text-indigo-600 hover:text-indigo-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(session.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSessions.length === 0 && (
             <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <AlertCircle className="w-10 h-10 mb-2 text-gray-300" />
                <p>未找到匹配的数据</p>
             </div>
          )}
          {filteredSessions.length > 100 && (
            <div className="p-4 text-center text-xs text-gray-400 bg-gray-50">
              为优化性能，仅显示前 100 条数据 (请使用搜索查找更多)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCenter;