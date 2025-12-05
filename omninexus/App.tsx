
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Shield, Gamepad2, Briefcase, Server, MessageSquare, Send, ChevronRight, Menu, Network, Wifi, WifiOff, Bot } from 'lucide-react';
import { DomainType, ChatMessage } from './types';
import { processUserQuery } from './services/nexusOrchestrator';
import CyberModule from './components/CyberModule';
import GamingModule from './components/GamingModule';
import InfraModule from './components/InfraModule';
import ProductivityModule from './components/ProductivityModule';
import AIModule from './components/AIModule';
import DashboardView from './components/DashboardView';
import { getGlobalContext } from './services/mockDataStore';

const App: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<DomainType>(DomainType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [networkMode, setNetworkMode] = useState<'CLOUD' | 'LOCAL'>('CLOUD');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChatSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const textToProcess = overrideInput || chatInput;
    
    if (!textToProcess.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToProcess,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsProcessing(true);

    // Fetch the real-time context from our data store
    const currentContext = getGlobalContext();
    
    // Use Nexus Orchestrator instead of direct Gemini service
    const result = await processUserQuery(textToProcess, currentContext, networkMode);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: result.text,
      timestamp: Date.now(),
      suggestedAction: result.domain,
      mode: result.source
    };

    setChatHistory(prev => [...prev, modelMsg]);
    setIsProcessing(false);

    // Auto-switch domain if suggested
    if (result.domain && result.domain !== activeDomain) {
      setActiveDomain(result.domain);
    }
  };

  const toggleNetworkMode = () => {
      setNetworkMode(prev => prev === 'CLOUD' ? 'LOCAL' : 'CLOUD');
  };

  const renderContent = () => {
    switch (activeDomain) {
      case DomainType.CYBER:
        return <CyberModule />;
      case DomainType.GAMING:
        return <GamingModule />;
      case DomainType.INFRASTRUCTURE:
        return <InfraModule />;
      case DomainType.PRODUCTIVITY:
        return <ProductivityModule />;
      case DomainType.AI_LAB:
        return <AIModule />;
      case DomainType.DASHBOARD:
      default:
        return <DashboardView onNavigate={setActiveDomain} onQuickChat={(msg) => handleChatSubmit(undefined, msg)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050508] text-white font-sans selection:bg-purple-500/30">
      
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0a0f] border-r border-gray-800 flex flex-col transition-all duration-300 relative z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {isSidebarOpen && <span className="font-bold tracking-widest text-sm text-gray-400">NEXUS_OS</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded text-gray-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          {[
            { id: DomainType.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-400' },
            { id: DomainType.CYBER, icon: Shield, label: 'Cyber Ops', color: 'text-cyan-400' },
            { id: DomainType.GAMING, icon: Gamepad2, label: 'Gaming', color: 'text-purple-400' },
            { id: DomainType.PRODUCTIVITY, icon: Briefcase, label: 'Productivity', color: 'text-green-400' },
            { id: DomainType.INFRASTRUCTURE, icon: Server, label: 'Infrastructure', color: 'text-orange-400' },
            { id: DomainType.AI_LAB, icon: Bot, label: 'AI Lab', color: 'text-pink-400' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveDomain(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeDomain === item.id 
                  ? 'bg-white/5 text-white border border-white/10' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeDomain === item.id ? item.color : ''}`} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              {activeDomain === item.id && isSidebarOpen && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
             {/* Unified Gateway Status Indicator */}
             <div className="relative">
                <Network className="w-4 h-4 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black" />
             </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Unified Gateway</span>
                <span className="text-xs text-green-400 font-mono">CONNECTED (KONG)</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {/* AI Assistant Panel (Always visible on right or toggleable) */}
      <aside className="w-80 border-l border-gray-800 bg-[#0a0a0f] flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-300">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            NEXUS AI
          </h3>
          <button 
             onClick={toggleNetworkMode}
             className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border transition-all ${
                 networkMode === 'CLOUD' 
                 ? 'bg-blue-900/30 text-blue-400 border-blue-800 hover:bg-blue-900/50' 
                 : 'bg-purple-900/30 text-purple-400 border-purple-800 hover:bg-purple-900/50'
             }`}
             title="Toggle Cloud/Local AI"
          >
             {networkMode === 'CLOUD' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
             {networkMode}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-600 text-sm mt-10">
              <p>Awaiting input...</p>
              <p className="text-xs mt-2">Try: "Can I afford a Black Lotus?" or "Budget status"</p>
            </div>
          )}
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-lg text-sm border ${
                msg.role === 'user' 
                  ? 'bg-blue-600/20 text-blue-100 border-blue-600/30' 
                  : msg.mode === 'LOCAL' 
                    ? 'bg-purple-900/20 text-purple-100 border-purple-500/30'
                    : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}>
                {msg.content}
              </div>
              <div className="flex gap-2 mt-1">
                  {msg.role === 'model' && (
                      <span className={`text-[9px] font-mono px-1 rounded ${msg.mode === 'LOCAL' ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-400'}`}>
                          {msg.mode}
                      </span>
                  )}
                  {msg.suggestedAction && (
                    <span className="text-[9px] text-gray-500 font-mono">
                      Route: {msg.suggestedAction}
                    </span>
                  )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={(e) => handleChatSubmit(e)} className="p-4 border-t border-gray-800 bg-gray-900/30">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={networkMode === 'LOCAL' ? "Command Swarm Agents..." : "Query Cloud Intelligence..."}
              className={`w-full bg-black border rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none transition-all text-white placeholder-gray-600 ${
                  networkMode === 'LOCAL' 
                  ? 'border-purple-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                  : 'border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              disabled={isProcessing}
            />
            <button 
              type="submit"
              disabled={isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </aside>

    </div>
  );
};

export default App;