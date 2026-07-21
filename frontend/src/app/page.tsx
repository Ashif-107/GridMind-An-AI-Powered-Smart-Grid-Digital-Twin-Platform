'use client';

import { useState } from 'react';
import { useGridData } from '@/hooks/useGridData';
import TopBar from '@/components/TopBar';
import Tabs from '@/components/Tabs';
import LiveGrid from '@/components/tabs/LiveGrid';
import Analytics from '@/components/tabs/Analytics';
import AICommand from '@/components/tabs/AICommand';

export default function Home() {
  const { data, connected } = useGridData();
  const [activeTab, setActiveTab] = useState('live');

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Background ambient glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <TopBar data={data} connected={connected} />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 w-full max-w-7xl mx-auto">
          {activeTab === 'live' && <LiveGrid data={data} />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'ai' && <AICommand />}
        </div>
      </div>
    </main>
  );
}
