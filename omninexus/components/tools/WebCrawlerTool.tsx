
import React, { useState, useEffect } from 'react';
import { Globe, Search, Database, Utensils, ShieldAlert, Gamepad2, Play, Terminal, CheckCircle, Loader2 } from 'lucide-react';
import { CrawlerTask } from '../../types';
import { MOCK_CRAWLER_TASKS } from '../../services/mockDataStore';

const WebCrawlerTool: React.FC = () => {
  const [tasks, setTasks] = useState<CrawlerTask[]>(MOCK_CRAWLER_TASKS);
  const [urlInput, setUrlInput] = useState('');
  const [targetType, setTargetType] = useState<'RECIPE' | 'THREAT_INTEL' | 'TCG_CARD'>('RECIPE');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Simulation of progress
  useEffect(() => {
    const interval = setInterval(() => {
        setTasks(prev => prev.map(t => {
            if (t.status === 'CRAWLING' || t.status === 'PARSING') {
                const newProgress = Math.min(t.progress + 5, 100);
                if (newProgress === 100) {
                    // Log completion
                    addLog(`[${t.targetType}] Task ${t.id} finished successfully.`);
                    return { ...t, progress: 100, status: 'COMPLETED' };
                }
                return { ...t, progress: newProgress, status: newProgress > 50 ? 'PARSING' : 'CRAWLING' };
            }
            return t;
        }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
      setConsoleLogs(prev => [`> ${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 50));
  };

  const handleQueueTask = () => {
      if (!urlInput) return;
      
      const newTask: CrawlerTask = {
          id: `ct-${Date.now()}`,
          url: urlInput,
          targetType,
          status: 'CRAWLING', // Auto start for demo
          progress: 0
      };
      
      setTasks([newTask, ...tasks]);
      addLog(`Queued new task: ${targetType} scrape for ${urlInput}`);
      setUrlInput('');
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'COMPLETED': return 'text-green-400 bg-green-900/20 border-green-900/50';
          case 'FAILED': return 'text-red-400 bg-red-900/20 border-red-900/50';
          case 'PENDING': return 'text-gray-400 bg-gray-800 border-gray-700';
          default: return 'text-blue-400 bg-blue-900/20 border-blue-900/50';
      }
  };

  const getTypeIcon = (type: string) => {
      switch (type) {
          case 'RECIPE': return <Utensils className="w-4 h-4 text-green-400" />;
          case 'THREAT_INTEL': return <ShieldAlert className="w-4 h-4 text-red-400" />;
          case 'TCG_CARD': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
          default: return <Globe className="w-4 h-4" />;
      }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900/20 p-2 rounded-lg">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Nexus Web Crawler</h2>
            <p className="text-xs text-gray-500 font-mono">SCRAPER // PARSER // KNOWLEDGE_INGESTION</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
             <div className="text-xs text-gray-500 font-mono">
                 <span className="text-green-400">{tasks.filter(t => t.status === 'COMPLETED').length}</span> Processed
             </div>
             <div className="w-px h-4 bg-gray-700"></div>
             <div className="text-xs text-gray-500 font-mono">
                 <span className="text-blue-400">{tasks.filter(t => ['CRAWLING', 'PARSING'].includes(t.status)).length}</span> Active
             </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
         
         {/* Left Col: Task Input & Console */}
         <div className="flex flex-col gap-6 overflow-hidden">
            
            {/* Input Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">New Extraction Task</h3>
               
               <div className="space-y-4">
                   <div>
                       <label className="text-xs text-gray-500 font-bold mb-1 block">Target Domain</label>
                       <div className="grid grid-cols-3 gap-2">
                           <button 
                             onClick={() => setTargetType('RECIPE')}
                             className={`p-2 rounded border text-xs font-bold flex flex-col items-center gap-1 transition-all ${targetType === 'RECIPE' ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-black/40 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                           >
                               <Utensils className="w-4 h-4" /> Recipe
                           </button>
                           <button 
                             onClick={() => setTargetType('THREAT_INTEL')}
                             className={`p-2 rounded border text-xs font-bold flex flex-col items-center gap-1 transition-all ${targetType === 'THREAT_INTEL' ? 'bg-red-900/30 border-red-500 text-red-300' : 'bg-black/40 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                           >
                               <ShieldAlert className="w-4 h-4" /> Intel
                           </button>
                           <button 
                             onClick={() => setTargetType('TCG_CARD')}
                             className={`p-2 rounded border text-xs font-bold flex flex-col items-center gap-1 transition-all ${targetType === 'TCG_CARD' ? 'bg-purple-900/30 border-purple-500 text-purple-300' : 'bg-black/40 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                           >
                               <Gamepad2 className="w-4 h-4" /> Cards
                           </button>
                       </div>
                   </div>

                   <div>
                       <label className="text-xs text-gray-500 font-bold mb-1 block">Source URL / Topic</label>
                       <div className="flex gap-2">
                           <div className="relative flex-1">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                               <input 
                                 type="text" 
                                 value={urlInput}
                                 onChange={(e) => setUrlInput(e.target.value)}
                                 placeholder={targetType === 'RECIPE' ? 'e.g. nytimes.com/chicken-soup' : 'e.g. alienvault.com/blog'}
                                 className="w-full bg-black/50 border border-gray-700 rounded py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-blue-500"
                               />
                           </div>
                           <button 
                             onClick={handleQueueTask}
                             disabled={!urlInput}
                             className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded px-4 py-2 text-xs font-bold flex items-center gap-2 transition-all"
                           >
                               <Play className="w-3 h-3" /> Queue
                           </button>
                       </div>
                   </div>
               </div>
            </div>

            {/* Live Console */}
            <div className="flex-1 bg-black border border-gray-800 rounded-lg flex flex-col overflow-hidden font-mono text-xs">
                <div className="p-2 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
                   <Terminal className="w-3 h-3 text-gray-400" />
                   <span className="text-[10px] font-bold text-gray-500 uppercase">Nexus Scraper Log</span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-1 text-gray-400">
                    {consoleLogs.length === 0 && <div className="opacity-30">System idle. Waiting for tasks...</div>}
                    {consoleLogs.map((log, i) => (
                        <div key={i} className="opacity-90">{log}</div>
                    ))}
                </div>
            </div>

         </div>

         {/* Right Col: Task Queue */}
         <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
             <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4 h-4" /> Ingestion Queue
                  </h3>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-2">
                 {tasks.map((task) => (
                     <div key={task.id} className="p-3 bg-black/20 border border-gray-800 rounded hover:border-blue-500/30 transition-all">
                         <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                 {getTypeIcon(task.targetType)}
                                 <span className="font-bold text-sm text-gray-200 line-clamp-1">{task.url}</span>
                             </div>
                             <div className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${getStatusColor(task.status)}`}>
                                 {task.status === 'CRAWLING' && <Loader2 className="w-3 h-3 animate-spin" />}
                                 {task.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                                 {task.status}
                             </div>
                         </div>
                         
                         {/* Progress Bar */}
                         {(task.status === 'CRAWLING' || task.status === 'PARSING') && (
                             <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                                 <div 
                                   className="h-full bg-blue-500 transition-all duration-300"
                                   style={{ width: `${task.progress}%` }}
                                 ></div>
                             </div>
                         )}

                         {task.resultSummary && (
                             <div className="text-xs text-gray-500 bg-black/30 p-2 rounded font-mono border border-gray-800/50">
                                 {task.resultSummary}
                             </div>
                         )}
                     </div>
                 ))}
             </div>
         </div>

      </div>
    </div>
  );
};

export default WebCrawlerTool;
