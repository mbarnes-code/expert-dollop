
import React, { useState } from 'react';
import { Play, Pause, Plus, Settings, CheckCircle, AlertCircle, Sparkles, ArrowRight, Database, Code, Send, Globe } from 'lucide-react';
import { NexusWorkflow } from '../../types';
import { MOCK_WORKFLOWS, getWorkflowHints } from '../../services/mockDataStore';

const WorkflowBuilderTool: React.FC = () => {
  const [workflows, setWorkflows] = useState<NexusWorkflow[]>(MOCK_WORKFLOWS);
  const [hints, setHints] = useState<NexusWorkflow[]>(getWorkflowHints());
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  const toggleEnabled = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const acceptHint = (hint: NexusWorkflow) => {
    setWorkflows([...workflows, { ...hint, id: `wf-${Date.now()}`, enabled: true }]);
    setHints(hints.filter(h => h.id !== hint.id));
  };

  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  const getStepIcon = (type: string) => {
    switch (type) {
        case 'QUERY_DB': return <Database className="w-4 h-4 text-blue-400" />;
        case 'RUN_SCRIPT': return <Code className="w-4 h-4 text-green-400" />;
        case 'SEND_ALERT': return <Send className="w-4 h-4 text-red-400" />;
        case 'HTTP_REQUEST': return <Globe className="w-4 h-4 text-orange-400" />;
        default: return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-purple-900/20 p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">AI Workflow Studio</h2>
            <p className="text-xs text-gray-500 font-mono">AUTOMATION // NEXUS_CORE // V1.0</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold flex items-center gap-2 shadow-lg transition-all">
           <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
         
         {/* Left Col: Workflow List & Hints */}
         <div className="flex flex-col gap-6 overflow-hidden">
            
            {/* Active Workflows */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col flex-1 overflow-hidden">
               <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Workflows</h3>
                  <span className="text-[10px] bg-purple-900/40 text-purple-300 px-2 rounded-full">{workflows.length}</span>
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {workflows.map(wf => (
                      <div 
                        key={wf.id} 
                        onClick={() => setSelectedWorkflowId(wf.id)}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                            activeWorkflow?.id === wf.id 
                            ? 'bg-purple-900/20 border-purple-500' 
                            : 'bg-black/20 border-gray-800 hover:border-gray-600'
                        }`}
                      >
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-gray-200">{wf.name}</span>
                            <div onClick={(e) => { e.stopPropagation(); toggleEnabled(wf.id); }} className={`cursor-pointer ${wf.enabled ? 'text-green-400' : 'text-gray-600'}`}>
                                {wf.enabled ? <CheckCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </div>
                         </div>
                         <p className="text-[10px] text-gray-500 line-clamp-2">{wf.description}</p>
                         <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-gray-600">
                             <span className="px-1.5 py-0.5 rounded bg-gray-800 uppercase">{wf.trigger}</span>
                             <span>Last Run: {wf.lastRun || 'Never'}</span>
                         </div>
                      </div>
                  ))}
               </div>
            </div>

            {/* Smart Hints */}
            <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Sparkles className="w-3 h-3" /> Nexus Suggestions
                </h3>
                <div className="space-y-3">
                    {hints.length === 0 && <div className="text-[10px] text-gray-500 italic">No new suggestions based on your activity.</div>}
                    {hints.map(hint => (
                        <div key={hint.id} className="bg-black/40 border border-purple-500/30 p-3 rounded hover:bg-black/60 transition-colors">
                            <div className="text-xs font-bold text-gray-200 mb-1">{hint.name}</div>
                            <div className="text-[10px] text-gray-400 mb-2">{hint.description}</div>
                            <button 
                                onClick={() => acceptHint(hint)}
                                className="w-full py-1 text-[10px] font-bold bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                            >
                                Enable Automation
                            </button>
                        </div>
                    ))}
                </div>
            </div>

         </div>

         {/* Center/Right Col: Editor */}
         <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
             {activeWorkflow ? (
                 <>
                    <div className="p-4 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                                {activeWorkflow.name}
                                {activeWorkflow.enabled ? (
                                    <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-900 px-2 py-0.5 rounded">ACTIVE</span>
                                ) : (
                                    <span className="text-[10px] bg-gray-800 text-gray-500 border border-gray-700 px-2 py-0.5 rounded">DISABLED</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">{activeWorkflow.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-800 rounded text-gray-400" title="Settings"><Settings className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-gray-800 rounded text-green-400" title="Run Now"><Play className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 bg-black/40 p-8 overflow-y-auto relative">
                        {/* Visual Workflow Steps */}
                        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-800 z-0"></div>
                        
                        <div className="space-y-8 relative z-10">
                            {/* Trigger Node */}
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center border-4 border-gray-900 shadow-lg shrink-0">
                                    <Play className="w-3 h-3 text-white" />
                                </div>
                                <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg min-w-[300px]">
                                    <div className="text-xs font-bold text-purple-400 uppercase mb-1">Trigger</div>
                                    <div className="text-sm text-gray-200">On {activeWorkflow.trigger}</div>
                                </div>
                            </div>

                            {/* Steps */}
                            {activeWorkflow.steps.map((step, idx) => (
                                <div key={step.id} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-900 shadow-lg shrink-0">
                                        <div className="text-xs font-bold text-gray-300">{idx + 1}</div>
                                    </div>
                                    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg min-w-[300px] hover:border-purple-500/50 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
                                                {getStepIcon(step.type)} {step.type}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                        <div className="text-sm font-bold text-gray-200 mb-1">{step.name}</div>
                                        <div className="bg-black/30 p-2 rounded text-[10px] font-mono text-gray-400 border border-gray-800 truncate max-w-[400px]">
                                            {step.config}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Step Button */}
                            <div className="flex items-start gap-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-900 shrink-0 border-dashed">
                                    <Plus className="w-3 h-3 text-gray-500" />
                                </div>
                                <div className="text-xs font-bold text-gray-500 mt-2">Add Next Step</div>
                            </div>
                        </div>
                    </div>
                 </>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                     <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                     <p>Select a workflow to edit</p>
                 </div>
             )}
         </div>

      </div>
    </div>
  );
};

export default WorkflowBuilderTool;