
import React, { useState } from 'react';
import { Server, Workflow, Box, Network, Cpu, Layers, RefreshCw, CheckCircle, XCircle, Shield, Gamepad2, Briefcase, Brain, LayoutGrid, Database, DollarSign, AlertTriangle } from 'lucide-react';
import { NxProject, DomainType, GatewayRoute } from '../types';
import SwarmControlTool from './tools/SwarmControlTool';
import DatabaseManagerTool from './tools/DatabaseManagerTool';
import { MOCK_BUDGETS } from '../services/mockDataStore';

const MOCK_PROJECTS: NxProject[] = [
  // Cyber
  { name: 'HELK', domain: DomainType.CYBER, tags: ['siem', 'docker'], status: 'success', lastBuild: '2m ago', estimatedCost: 120 },
  { name: 'CyberChef', domain: DomainType.CYBER, tags: ['utils', 'web'], status: 'cached', lastBuild: '1h ago', estimatedCost: 5 },
  { name: 'MISP', domain: DomainType.CYBER, tags: ['intel', 'php'], status: 'success', lastBuild: '5m ago', estimatedCost: 45 },
  { name: 'Yara-X', domain: DomainType.CYBER, tags: ['analysis', 'rust'], status: 'cached', lastBuild: '30m ago', estimatedCost: 0 },
  { name: 'SecurityOnion', domain: DomainType.CYBER, tags: ['nsm', 'elastic'], status: 'building', lastBuild: 'Now', estimatedCost: 200 },
  { name: 'Nemesis', domain: DomainType.CYBER, tags: ['offensive', 'data'], status: 'success', lastBuild: '10m ago', estimatedCost: 80 },
  
  // Gaming
  { name: 'CommanderSpellbook', domain: DomainType.GAMING, tags: ['api', 'combo'], status: 'cached', lastBuild: '4h ago', estimatedCost: 15 },
  { name: 'MTG-Map', domain: DomainType.GAMING, tags: ['viz', 'd3'], status: 'success', lastBuild: '1d ago', estimatedCost: 10 },
  
  // Productivity
  { name: 'ActualBudget', domain: DomainType.PRODUCTIVITY, tags: ['finance', 'node'], status: 'cached', lastBuild: '2h ago', estimatedCost: 0 },
  { name: 'Mealie', domain: DomainType.PRODUCTIVITY, tags: ['recipes', 'python'], status: 'success', lastBuild: '3h ago', estimatedCost: 5 },
  { name: 'N8N', domain: DomainType.PRODUCTIVITY, tags: ['workflow', 'automation'], status: 'success', lastBuild: '15m ago', estimatedCost: 25 },
  
  // Infrastructure / MCP
  { name: 'Kong-Gateway', domain: DomainType.INFRASTRUCTURE, tags: ['gateway', 'lua'], status: 'success', lastBuild: '1m ago', estimatedCost: 60 },
  { name: 'Firecrawl-MCP', domain: DomainType.INFRASTRUCTURE, tags: ['mcp', 'search'], status: 'cached', lastBuild: '5h ago', estimatedCost: 10 },
  { name: 'HexStrike-AI', domain: DomainType.INFRASTRUCTURE, tags: ['mcp', 'ai'], status: 'failed', lastBuild: '10s ago', estimatedCost: 30 },
];

const MOCK_ROUTES: GatewayRoute[] = [
  { path: '/api/v1/cyber/helk/*', service: 'svc-helk', method: 'ANY', status: 'active', latency: 24 },
  { path: '/api/v1/cyber/misp/*', service: 'svc-misp', method: 'GET', status: 'active', latency: 45 },
  { path: '/api/v1/gaming/cards/*', service: 'svc-scryfall-proxy', method: 'GET', status: 'active', latency: 120 },
  { path: '/api/v1/prod/workflow/*', service: 'svc-n8n', method: 'POST', status: 'active', latency: 15 },
  { path: '/api/v1/mcp/dispatch', service: 'svc-mcp-router', method: 'POST', status: 'active', latency: 8 },
  { path: '/auth/*', service: 'svc-auth-provider', method: 'ANY', status: 'active', latency: 30 },
];

const InfraModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<'OVERVIEW' | 'SWARM' | 'DATA_CENTER'>('OVERVIEW');
  const [filter, setFilter] = useState<DomainType | 'ALL'>('ALL');

  // Budget Check
  const techBudget = MOCK_BUDGETS.find(b => b.category === 'TECH');
  const remainingBudget = techBudget ? techBudget.limit - techBudget.spent : 0;
  const totalEstCost = MOCK_PROJECTS.reduce((acc, p) => acc + (p.estimatedCost || 0), 0);

  const filteredProjects = filter === 'ALL' 
    ? MOCK_PROJECTS 
    : MOCK_PROJECTS.filter(p => p.domain === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cached': return <Layers className="w-4 h-4 text-blue-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'building': return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-600" />;
    }
  };

  if (currentView === 'SWARM') {
      return (
          <div className="h-full flex flex-col space-y-6 animate-fade-in">
             <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                  <h2 className="text-3xl font-bold text-orange-400 tracking-tighter flex items-center gap-2">
                    <Brain className="w-8 h-8" />
                    LOCAL_SWARM_CONTROL
                  </h2>
                  <p className="text-gray-400 text-sm font-mono mt-1">vLLM Cluster // Head Agent // Task Orchestration</p>
                </div>
                <button 
                     onClick={() => setCurrentView('OVERVIEW')}
                     className="px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500"
                   >
                     <LayoutGrid className="w-4 h-4" /> Back to Infra Overview
                </button>
             </header>
             <SwarmControlTool />
          </div>
      )
  }

  if (currentView === 'DATA_CENTER') {
    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in">
           <header className="flex justify-between items-center border-b border-gray-700 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-blue-400 tracking-tighter flex items-center gap-2">
                  <Database className="w-8 h-8" />
                  NEXUS_DATA_CENTER
                </h2>
                <p className="text-gray-400 text-sm font-mono mt-1">PostgreSQL Local // Django Backend // Docker Containers</p>
              </div>
              <button 
                   onClick={() => setCurrentView('OVERVIEW')}
                   className="px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500"
                 >
                   <LayoutGrid className="w-4 h-4" /> Back to Infra Overview
              </button>
           </header>
           <DatabaseManagerTool />
        </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      <header className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-orange-400 tracking-tighter flex items-center gap-2">
            <Server className="w-8 h-8" />
            INFRASTRUCTURE_HUB
          </h2>
          <p className="text-gray-400 text-sm font-mono mt-1">Unified Gateway // NX Monorepo // MCP Orchestration</p>
        </div>
        <div className="flex gap-4 items-center">
            <button 
                 onClick={() => setCurrentView('DATA_CENTER')}
                 className="px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-blue-900/20 text-blue-400 border border-blue-900/50 hover:bg-blue-900/40"
               >
                 <Database className="w-4 h-4" /> Data Center
            </button>
            <button 
                 onClick={() => setCurrentView('SWARM')}
                 className="px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 bg-purple-900/20 text-purple-400 border border-purple-900/50 hover:bg-purple-900/40"
               >
                 <Brain className="w-4 h-4" /> Open Swarm Control
            </button>
            <div className="flex gap-2">
              {['NX', 'PNPM', 'Makefile', 'Babel', 'ts-morph'].map(tech => (
                <span key={tech} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs font-mono text-gray-400">
                  {tech}
                </span>
              ))}
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* Left Column: Unified Gateway (Kong) - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="bg-gray-900 border border-orange-900/50 rounded-lg p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-orange-300 mb-4 flex items-center gap-2">
                <Network className="w-5 h-5" />
                Unified API Gateway (Kong)
            </h3>
            <div className="flex items-center justify-between mb-4 p-3 bg-black/40 rounded border border-gray-800">
              <span className="text-xs text-gray-400 font-mono">GATEWAY_STATUS</span>
              <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50">ONLINE</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {MOCK_ROUTES.map((route, i) => (
                <div key={i} className="group p-3 bg-black/20 border border-gray-800 rounded hover:border-orange-500/30 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-xs text-gray-300 truncate max-w-[180px]" title={route.path}>{route.path}</span>
                    <span className={`text-[10px] px-1.5 rounded font-bold ${route.method === 'GET' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'}`}>
                      {route.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Workflow className="w-3 h-3" /> {route.service}
                    </span>
                    <span className="font-mono">{route.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* MCP Status */}
          <div className="bg-gray-900 border border-orange-900/50 rounded-lg p-5 h-1/3">
            <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Active MCP Servers
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Firecrawl', 'VirusTotal', 'HexStrike', 'MalwareBazaar', 'FileScope'].map((mcp, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-gray-800 rounded-full text-xs text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {mcp}
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Modular Monolith Workspace (NX) - 8 cols */}
        <div className="lg:col-span-8 bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-400" />
                NX Modular Monolith Workspace
            </h3>
            <div className="flex bg-black/50 rounded-lg p-1 border border-gray-800">
               {[
                 { id: 'ALL', icon: Layers, label: 'All' },
                 { id: DomainType.CYBER, icon: Shield, label: 'Cyber' },
                 { id: DomainType.GAMING, icon: Gamepad2, label: 'Gaming' },
                 { id: DomainType.PRODUCTIVITY, icon: Briefcase, label: 'Prod' },
               ].map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      filter === tab.id 
                        ? 'bg-gray-700 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                 >
                   <tab.icon className="w-3 h-3" />
                   <span className="hidden sm:inline">{tab.label}</span>
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {filteredProjects.map((project, idx) => (
              <div key={idx} className="bg-black/20 border border-gray-800 rounded-lg p-4 hover:border-blue-500/30 transition-all group relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{project.name}</div>
                  {getStatusIcon(project.status)}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 font-mono pt-3 border-t border-gray-800/50">
                   <span>Est. Cost: ${project.estimatedCost}/mo</span>
                   <span className="opacity-0 group-hover:opacity-100 text-blue-400 cursor-pointer">View Graph &rarr;</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
             <div className="flex items-center gap-4">
                <span>Total Infrastructure Cost: <span className="text-gray-300 font-bold">${totalEstCost}/mo</span></span>
                <span className={remainingBudget < totalEstCost ? 'text-red-400 font-bold flex items-center gap-1' : 'text-green-500'}>
                    {remainingBudget < totalEstCost && <AlertTriangle className="w-3 h-3" />}
                    Budget Status: {remainingBudget < totalEstCost ? 'OVER BUDGET' : 'OK'}
                </span>
             </div>
             <div className="flex gap-4">
               <span>Affected: 3 projects</span>
               <span>Cache Hit Rate: 94%</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfraModule;
