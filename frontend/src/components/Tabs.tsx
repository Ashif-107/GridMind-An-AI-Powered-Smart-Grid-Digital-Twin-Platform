'use client';

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs = [
    { id: 'live', label: 'Live Grid' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'ai', label: 'AI Command Center' }
  ];

  return (
    <div className="w-full border-b border-slate-800 bg-slate-900/50 pt-4 px-8">
      <div className="flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              pb-4 px-2 text-sm font-semibold uppercase tracking-wider transition-all duration-200
              ${activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-500' 
                : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
