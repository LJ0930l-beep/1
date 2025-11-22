import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, BarChart2, PlusCircle, Radio, Database } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  
  const menuItems = [
    { id: ViewState.DASHBOARD, label: '总览看板', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: ViewState.ANALYTICS, label: '数据分析 & AI', icon: <BarChart2 className="w-5 h-5" /> },
    { id: ViewState.DATA_CENTER, label: '数据中心', icon: <Database className="w-5 h-5" /> },
    { id: ViewState.HOSTS, label: '主播管理', icon: <Users className="w-5 h-5" /> },
    { id: ViewState.LOG_SESSION, label: '数据录入', icon: <PlusCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white h-full border-r border-gray-200 w-64 flex-shrink-0 hidden md:flex flex-col">
      <div className="p-6 flex items-center border-b border-gray-100">
        <div className="bg-indigo-600 p-2 rounded-lg mr-3">
            <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">StreamSync</span>
      </div>

      <nav className="p-4 space-y-1 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
              currentView === item.id
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={`mr-3 ${currentView === item.id ? 'text-indigo-600' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">专业版</p>
          <p className="text-sm font-medium">您正在使用 StreamSync Pro</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;