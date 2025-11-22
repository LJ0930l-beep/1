import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  icon: React.ReactNode;
  subtext?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, change, icon, subtext, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 active:scale-95' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
          {icon}
        </div>
      </div>
      {(trend || subtext) && (
        <div className="mt-4 flex items-center text-sm">
          {trend && (
             <span className={`flex items-center font-medium ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trend === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
                {trend === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
                {trend === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
                {change}
             </span>
          )}
          <span className="text-gray-500 ml-2">{subtext}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;