import React, { useState } from 'react';
import { ViewState, Session, Host } from './types';
import { MOCK_HOSTS, MOCK_SESSIONS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HostsList from './components/HostsList';
import Analytics from './components/Analytics';
import SessionLogger from './components/SessionLogger';
import DataCenter from './components/DataCenter';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [hosts, setHosts] = useState<Host[]>(MOCK_HOSTS);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSaveSession = (newSession: Session) => {
    setSessions(prev => [...prev, newSession]);
    setCurrentView(ViewState.DASHBOARD); // Return to dashboard after save
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard sessions={sessions} hosts={hosts} onNavigate={setCurrentView} />;
      case ViewState.HOSTS:
        return <HostsList hosts={hosts} sessions={sessions} />;
      case ViewState.ANALYTICS:
        return <Analytics sessions={sessions} hosts={hosts} />;
      case ViewState.DATA_CENTER:
        return (
          <DataCenter 
            sessions={sessions} 
            hosts={hosts} 
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
          />
        );
      case ViewState.LOG_SESSION:
        return (
          <SessionLogger 
            hosts={hosts} 
            onSave={handleSaveSession} 
            onCancel={() => setCurrentView(ViewState.DASHBOARD)} 
          />
        );
      default:
        return <Dashboard sessions={sessions} hosts={hosts} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      {/* Mobile Header & Menu Overlay */}
      <div className={`fixed inset-0 z-50 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
         <div className={`absolute left-0 top-0 h-full w-64 bg-white transform transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 font-bold text-xl text-indigo-600">StreamSync</div>
             <nav className="p-4 space-y-2">
               <button onClick={() => {setCurrentView(ViewState.DASHBOARD); setIsMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-gray-700 font-medium">总览看板</button>
               <button onClick={() => {setCurrentView(ViewState.ANALYTICS); setIsMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-gray-700 font-medium">数据分析</button>
               <button onClick={() => {setCurrentView(ViewState.DATA_CENTER); setIsMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-gray-700 font-medium">数据中心</button>
               <button onClick={() => {setCurrentView(ViewState.HOSTS); setIsMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-gray-700 font-medium">主播管理</button>
               <button onClick={() => {setCurrentView(ViewState.LOG_SESSION); setIsMobileMenuOpen(false)}} className="block w-full text-left px-4 py-3 text-gray-700 font-medium">数据录入</button>
             </nav>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:hidden flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg">StreamSync</span>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Desktop Header (Top Bar) */}
        <header className="hidden md:flex bg-white shadow-sm border-b border-gray-200 px-8 py-4 justify-between items-center">
           <h1 className="text-2xl font-bold text-gray-800">
             {currentView === ViewState.DASHBOARD && '运营总览'}
             {currentView === ViewState.ANALYTICS && '深度分析'}
             {currentView === ViewState.DATA_CENTER && '数据中心'}
             {currentView === ViewState.HOSTS && '主播团队'}
             {currentView === ViewState.LOG_SESSION && '数据录入'}
           </h1>
           <div className="flex items-center space-x-4">
             <span className="text-sm text-gray-500">今天是 {new Date().toLocaleDateString('zh-CN')}</span>
             <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
               Admin
             </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;