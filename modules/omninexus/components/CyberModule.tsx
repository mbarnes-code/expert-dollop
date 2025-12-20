
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Terminal, Activity, Eye, Lock, Search, ChefHat, LayoutDashboard, Database, Scan, Globe, Server, PieChart } from 'lucide-react';
import { Tool } from '../types';
import CyberChefTool from './tools/CyberChefTool';
import CyberChefRecipes from './tools/CyberChefRecipes';
import YaraTool from './tools/YaraTool';
import HELKTool from './tools/HELKTool';
import MISPTool from './tools/MISPTool';
import { MOCK_ELASTIC_INDICES, MOCK_REDIS_DBS } from '../services/mockDataStore';

const mockData = [
  { time: '00:00', attacks: 120, blocked: 110 },
  { time: '04:00', attacks: 200, blocked: 195 },
  { time: '08:00', attacks: 150, blocked: 148 },
  { time: '12:00', attacks: 480, blocked: 450 },
  { time: '16:00', attacks: 390, blocked: 380 },
  { time: '20:00', attacks: 210, blocked: 205 },
  { time: '24:00', attacks: 180, blocked: 175 },
];

type CyberView = 'DASHBOARD' | 'CYBERCHEF' | 'RECIPES' | 'YARA' | 'HELK' | 'MISP';

const CyberModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<CyberView>('DASHBOARD');

  const renderContent = () => {
    switch(currentView) {
      case 'CYBERCHEF':
        return <CyberChefTool />;
      case 'RECIPES':
        return <CyberChefRecipes />;
      case 'YARA':
        return <YaraTool />;
      case 'HELK':
        return <HELKTool />;
      case 'MISP':
        return <MISPTool />;
      case 'DASHBOARD':
      default:
        return <DashboardView onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      <header className="flex justify-between items-center border-b border-cyber-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-cyber-accent tracking-tighter flex items-center gap-2">
            <Shield className="w-8 h-8" />
            SEC_OPS_CENTER
          </h2>
          <p className="text-gray-400 text-sm font-mono mt-1">Status: DEFENCON_4 // Monitoring Active</p>
        </div>
        
        {/* Module Navigation */}
        <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
           <button 
             onClick={() => setCurrentView('DASHBOARD')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'DASHBOARD' ? 'bg-cyber-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <LayoutDashboard className="w-4 h-4" /> Dashboard
           </button>
           <button 
             onClick={() => setCurrentView('CYBERCHEF')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'CYBERCHEF' ? 'bg-cyber-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <ChefHat className="w-4 h-4" /> CyberChef
           </button>
           <button 
             onClick={() => setCurrentView('RECIPES')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'RECIPES' ? 'bg-cyber-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <PieChart className="w-4 h-4" /> Recipes
           </button>
           <button 
             onClick={() => setCurrentView('YARA')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'YARA' ? 'bg-cyber-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Scan className="w-4 h-4" /> Yara-X
           </button>
            <button 
             onClick={() => setCurrentView('HELK')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'HELK' ? 'bg-cyber-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Database className="w-4 h-4" /> HELK
           </button>
           <button 
             onClick={() => setCurrentView('MISP')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'MISP' ? 'bg-cyber-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Globe className="w-4 h-4" /> MISP
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

// Extracted Dashboard Logic
const DashboardView: React.FC<{onChangeView: (view: CyberView) => void}> = ({ onChangeView }) => {
  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-cyber-800/50 border border-cyber-700 rounded-lg p-4 flex flex-col">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyber-accent" />
            NETWORK_TRAFFIC_ANALYSIS
          </h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2a6d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff2a6d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05ffa1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#05ffa1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="time" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1c2e', border: '1px solid #2d3748' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="attacks" stroke="#ff2a6d" fillOpacity={1} fill="url(#colorAttacks)" />
                <Area type="monotone" dataKey="blocked" stroke="#05ffa1" fillOpacity={1} fill="url(#colorBlocked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tool Launcher */}
        <div className="bg-cyber-800/50 border border-cyber-700 rounded-lg p-4 flex flex-col">
           <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyber-warning" />
            QUICK_LAUNCH
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {[
              { name: 'HELK', desc: 'Hunting ELK Stack', cat: 'SIEM', action: () => onChangeView('HELK') },
              { name: 'CyberChef', desc: 'Cyber Swiss Army Knife', cat: 'UTIL', action: () => onChangeView('CYBERCHEF') },
              { name: 'Yara-X', desc: 'Pattern Matching', cat: 'STATIC', action: () => onChangeView('YARA') },
              { name: 'MISP', desc: 'Malware Info Sharing', cat: 'INTEL', action: () => onChangeView('MISP') },
              { name: 'Maltrail', desc: 'Malicious Traffic', cat: 'NET', action: () => {} },
              { name: 'Nemesis', desc: 'Offensive Data Pipeline', cat: 'OFF', action: () => {} },
            ].map((tool, idx) => (
              <div key={idx} onClick={tool.action} className="group p-3 rounded bg-cyber-900 border border-cyber-700 hover:border-cyber-accent cursor-pointer transition-all flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-gray-200 group-hover:text-cyber-accent">{tool.name}</div>
                  <div className="text-xs text-gray-500">{tool.desc}</div>
                </div>
                <div className="px-2 py-1 rounded bg-black text-[10px] font-mono text-gray-400 border border-gray-800">
                  {tool.cat}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Logs Mockup */}
        <div className="lg:col-span-2 bg-black border border-cyber-700 rounded-lg p-4 font-mono text-sm h-48 overflow-hidden relative">
          <div className="absolute top-2 right-4 text-xs text-cyber-accent animate-pulse">LIVE_FEED</div>
          <div className="space-y-1 text-gray-400">
            <p><span className="text-blue-500">2023-10-27 14:02:11</span> <span className="text-yellow-500">[WARN]</span> Port scan detected from 192.168.1.44 -> Target: DC01</p>
            <p><span className="text-blue-500">2023-10-27 14:02:15</span> <span className="text-green-500">[INFO]</span> Maltrail: Known bad IP blocked (103.22.14.2)</p>
            <p><span className="text-blue-500">2023-10-27 14:02:44</span> <span className="text-red-500">[CRIT]</span> YARA Match: rule "WannaCry_variant_2" file: "invoice.pdf.exe"</p>
          </div>
        </div>

        {/* Data Backend Health Status (New) */}
        <div className="bg-cyber-800/50 border border-cyber-700 rounded-lg p-4 flex flex-col h-48">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
             <Server className="w-4 h-4 text-blue-400" /> Data Backend Health
           </h3>
           <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
             {MOCK_ELASTIC_INDICES.map((idx, i) => (
               <div key={`es-${i}`} className="flex justify-between items-center p-2 rounded bg-black/40 border border-gray-800">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${idx.health === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                     <div>
                       <div className="text-xs font-bold text-gray-300">{idx.app}</div>
                       <div className="text-[9px] text-gray-500 uppercase">Elasticsearch</div>
                     </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{idx.docs} docs</div>
               </div>
             ))}
             {/* Show relevant Redis items too */}
             {MOCK_REDIS_DBS.filter(db => ['Dispatch', 'HELK', 'MISP'].some(app => db.name.includes(app))).map((db, i) => (
               <div key={`rd-${i}`} className="flex justify-between items-center p-2 rounded bg-black/40 border border-gray-800">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${db.status === 'READY' ? 'bg-green-500' : 'bg-red-500'}`} />
                     <div>
                       <div className="text-xs font-bold text-gray-300">{db.name.split(' ')[0]}</div>
                       <div className="text-[9px] text-gray-500 uppercase">Redis DB{db.index}</div>
                     </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{db.memory}</div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}

export default CyberModule;