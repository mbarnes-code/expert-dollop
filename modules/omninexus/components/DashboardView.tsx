
import React, { useState } from 'react';
import { Shield, Utensils, Calendar, Wallet, ShoppingCart, ArrowRight, Activity, Terminal, ExternalLink, Zap, Bot, Globe, Play } from 'lucide-react';
import { getAggregatedCalendarEvents, MOCK_BUDGETS, MOCK_MEAL_PLAN, MOCK_MISP_EVENTS, MOCK_CYBER_NEWS, MOCK_CRAWLER_TASKS, MOCK_WORKFLOWS } from '../services/mockDataStore';
import { DomainType } from '../types';

interface DashboardViewProps {
  onNavigate: (domain: DomainType) => void;
  onQuickChat: (msg: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onQuickChat }) => {
  const [quickCmd, setQuickCmd] = useState('');

  // 1. Agenda Data (Simulated 'Today')
  const todayStr = '2023-10-27'; 
  const todaysEvents = getAggregatedCalendarEvents().filter(e => e.date === todayStr);

  // 2. Finance Data
  const gamingBudget = MOCK_BUDGETS.find(b => b.category === 'GAMING')!;
  const techBudget = MOCK_BUDGETS.find(b => b.category === 'TECH')!;
  
  const getBudgetPercent = (b: typeof gamingBudget) => Math.min((b.spent / b.limit) * 100, 100);

  // 3. Meal Data
  const todaysMeal = MOCK_MEAL_PLAN.find(m => m.date === todayStr);

  // 4. Cyber Feed (MISP + News)
  const threats = MOCK_MISP_EVENTS.slice(0, 2);
  const news = MOCK_CYBER_NEWS;

  // 5. AI Ops Data
  const activeCrawlerTasks = MOCK_CRAWLER_TASKS.filter(t => ['CRAWLING', 'PARSING'].includes(t.status));
  const quickWorkflows = MOCK_WORKFLOWS.filter(w => w.enabled).slice(0, 3);

  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(quickCmd.trim()) {
      onQuickChat(quickCmd);
      setQuickCmd('');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in text-gray-200">
      
      {/* Executive Header */}
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tighter">
            GOOD_MORNING_OPERATOR
          </h1>
          <p className="text-gray-400 font-mono mt-2 flex items-center gap-2">
            <span className="text-blue-400">DATE:</span> {new Date(todayStr).toDateString().toUpperCase()}
            <span className="text-gray-600">|</span>
            <span className="text-green-400">SYSTEMS:</span> NOMINAL
          </p>
        </div>
        
        {/* Quick Command Line */}
        <form onSubmit={handleCmdSubmit} className="relative w-96">
          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input 
            type="text" 
            value={quickCmd}
            onChange={(e) => setQuickCmd(e.target.value)}
            placeholder="Talk to Nexus AI (e.g., 'Analyze budget')" 
            className="w-full bg-black/50 border border-purple-900/50 focus:border-purple-500 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] focus:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          />
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Left Col: Life Ops (Agenda + Meals) */}
        <div className="flex flex-col gap-6">
          
          {/* Agenda Widget */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" /> Today's Agenda
              </h3>
              <span className="text-xs text-gray-500 font-mono">{todaysEvents.length} Events</span>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {todaysEvents.length === 0 && <div className="text-gray-600 text-xs italic">No events scheduled.</div>}
              {todaysEvents.map(evt => (
                <div key={evt.id} className="flex gap-3 items-start group">
                  <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    evt.type === 'TRANSACTION' ? 'bg-green-500' :
                    evt.type === 'CYBER_INCIDENT' ? 'bg-red-500' :
                    'bg-purple-500'
                  }`} />
                  <div>
                    <div className="text-sm font-bold text-gray-200 group-hover:text-blue-300 transition-colors">{evt.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{evt.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate(DomainType.PRODUCTIVITY)}
              className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Open Calendar <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Meal Plan Widget */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col flex-1">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Utensils className="w-4 h-4 text-green-400" /> Life Ops
              </h3>
              
              {todaysMeal ? (
                <div className="bg-black/20 rounded p-3 border border-gray-800">
                  <div className="text-xs text-green-500 font-bold uppercase mb-1">{todaysMeal.mealType}</div>
                  <div className="text-lg font-bold text-gray-200">{todaysMeal.recipeName}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">Prep Time: {todaysMeal.prepTime}</div>
                  
                  {todaysMeal.missingIngredients.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                       <div className="text-xs text-yellow-500 font-bold flex items-center gap-1 mb-1">
                          <ShoppingCart className="w-3 h-3" /> Missing Items
                       </div>
                       <div className="flex flex-wrap gap-1">
                          {todaysMeal.missingIngredients.map(item => (
                             <span key={item} className="px-2 py-0.5 bg-yellow-900/20 text-yellow-200 text-[10px] rounded border border-yellow-900/50">{item}</span>
                          ))}
                       </div>
                    </div>
                  ) : (
                     <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-green-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> All ingredients in stock (Mealie)
                     </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">No meal plan set for today.</div>
              )}
          </div>

        </div>

        {/* Center Col: Finance & AI Ops */}
        <div className="flex flex-col gap-6">
           
           {/* Finance Widget */}
           <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                <Wallet className="w-4 h-4 text-yellow-400" /> Finance Allowance
              </h3>

              {/* Gaming Budget */}
              <div className="mb-6">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-200">Gaming & Hobbies</span>
                    <span className={`text-sm font-mono font-bold ${gamingBudget.spent > gamingBudget.limit ? 'text-red-400' : 'text-green-400'}`}>
                       ${(gamingBudget.limit - gamingBudget.spent).toFixed(0)} Left
                    </span>
                 </div>
                 <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-purple-500 transition-all duration-1000" 
                       style={{ width: `${getBudgetPercent(gamingBudget)}%` }}
                    />
                 </div>
                 <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                    <span>${gamingBudget.spent} Spent</span>
                    <span>Limit: ${gamingBudget.limit}</span>
                 </div>
              </div>

              {/* Tech Budget */}
              <div className="mb-6">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-200">Tech & Infra</span>
                    <span className={`text-sm font-mono font-bold ${techBudget.spent > techBudget.limit ? 'text-red-400' : 'text-green-400'}`}>
                       ${(techBudget.limit - techBudget.spent).toFixed(0)} Left
                    </span>
                 </div>
                 <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-blue-500 transition-all duration-1000" 
                       style={{ width: `${getBudgetPercent(techBudget)}%` }}
                    />
                 </div>
                 <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                    <span>${techBudget.spent} Spent</span>
                    <span>Limit: ${techBudget.limit}</span>
                 </div>
              </div>
           </div>

           {/* AI Operations Widget (New) */}
           <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col flex-1">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Bot className="w-4 h-4 text-purple-400" /> Nexus Operations
               </h3>
               
               {/* Active Crawler Status */}
               <div className="bg-black/20 rounded p-3 border border-gray-800 mb-4">
                  <div className="flex justify-between items-center mb-2">
                     <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
                         <Globe className="w-3 h-3" /> Web Crawler
                     </div>
                     <span className={`text-[10px] px-1.5 rounded ${activeCrawlerTasks.length > 0 ? 'bg-blue-900 text-blue-300 animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                         {activeCrawlerTasks.length > 0 ? 'ACTIVE' : 'IDLE'}
                     </span>
                  </div>
                  {activeCrawlerTasks.length > 0 ? (
                     <div>
                        <div className="text-xs text-gray-300 truncate mb-1">{activeCrawlerTasks[0].url}</div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{width: `${activeCrawlerTasks[0].progress}%`}}></div>
                        </div>
                     </div>
                  ) : (
                     <div className="text-xs text-gray-600 italic">No extraction tasks running.</div>
                  )}
               </div>

               {/* Workflow Shortcuts */}
               <div className="flex-1">
                  <div className="text-xs font-bold text-gray-400 flex items-center gap-2 mb-2">
                      <Play className="w-3 h-3" /> Quick Workflows
                  </div>
                  <div className="space-y-2">
                     {quickWorkflows.map(wf => (
                        <button 
                          key={wf.id}
                          onClick={() => onQuickChat(`Execute workflow: ${wf.name}`)}
                          className="w-full text-left p-2 rounded bg-purple-900/10 hover:bg-purple-900/20 border border-purple-900/30 hover:border-purple-500/50 transition-all group"
                        >
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-purple-200 group-hover:text-purple-100">{wf.name}</span>
                              <Play className="w-3 h-3 text-purple-500 opacity-50 group-hover:opacity-100" />
                           </div>
                           <div className="text-[10px] text-gray-500 line-clamp-1">{wf.description}</div>
                        </button>
                     ))}
                     <button 
                        onClick={() => onNavigate(DomainType.AI_LAB)}
                        className="w-full py-1 text-[10px] text-gray-500 hover:text-gray-300 border border-dashed border-gray-800 rounded hover:border-gray-600 transition-all"
                     >
                        + Manage Automations
                     </button>
                  </div>
               </div>
           </div>

        </div>

        {/* Right Col: Threat Landscape */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col overflow-hidden">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-red-500" /> Threat Intelligence
           </h3>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              
              {/* Active Threats (MISP) */}
              <div>
                 <div className="text-[10px] text-red-400 font-bold uppercase mb-2">Active Incidents (MISP)</div>
                 <div className="space-y-2">
                    {threats.map(t => (
                       <div key={t.id} className="p-3 bg-red-900/10 border border-red-900/30 rounded hover:bg-red-900/20 transition-colors cursor-pointer" onClick={() => onNavigate(DomainType.CYBER)}>
                          <div className="flex justify-between mb-1">
                             <span className="text-xs font-bold text-gray-200">{t.org}</span>
                             <span className="text-[10px] px-1.5 rounded bg-red-900 text-red-100">HIGH</span>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-2">{t.info}</p>
                       </div>
                    ))}
                 </div>
              </div>

              {/* News Feed */}
              <div>
                 <div className="text-[10px] text-blue-400 font-bold uppercase mb-2 mt-2">Cyber & Gaming Feed</div>
                 <div className="space-y-2">
                    {news.map(n => (
                       <div key={n.id} className="p-3 bg-black/20 border border-gray-800 rounded hover:border-gray-600 transition-colors group">
                          <div className="flex justify-between mb-1">
                             <span className="text-xs font-bold text-gray-300 group-hover:text-blue-300">{n.source}</span>
                             <span className="text-[10px] text-gray-600">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-gray-400">{n.title}</p>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ExternalLink className="w-3 h-3" /> Read source
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
           
           <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-green-500" /> YARA-X: Monitoring</span>
              <span>Updated: Now</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
