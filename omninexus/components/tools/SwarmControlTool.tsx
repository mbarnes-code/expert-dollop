
import React, { useEffect, useState } from 'react';
import { SwarmAgent, SwarmTask } from '../../types';
import { localSwarm } from '../../services/localSwarmService';
import { Brain, Shield, PenTool, Database, Server, Activity, Terminal } from 'lucide-react';

const SwarmControlTool: React.FC = () => {
  const [agents, setAgents] = useState<SwarmAgent[]>(localSwarm.getAgents());
  const [tasks, setTasks] = useState<SwarmTask[]>([]);

  useEffect(() => {
    const handleUpdate = (newTasks: SwarmTask[], newAgents: SwarmAgent[]) => {
      setTasks(newTasks);
      setAgents(newAgents);
    };
    localSwarm.subscribe(handleUpdate);
    return () => localSwarm.unsubscribe(handleUpdate);
  }, []);

  const getIcon = (role: string) => {
    switch(role) {
      case 'OVERLORD': return <Brain className="w-8 h-8 text-purple-500" />;
      case 'HUNTER': return <Shield className="w-6 h-6 text-red-500" />;
      case 'ORACLE': return <Database className="w-6 h-6 text-blue-500" />;
      case 'WEAVER': return <PenTool className="w-6 h-6 text-yellow-500" />;
      case 'CONSTRUCT': return <Server className="w-6 h-6 text-green-500" />;
      default: return <Activity className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'THINKING': return 'animate-pulse ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] bg-purple-900/20';
      case 'IDLE': return 'bg-gray-900 border-gray-700';
      case 'OFFLINE': return 'bg-red-900/20 grayscale opacity-50';
      default: return 'bg-gray-900';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-purple-900/20 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Local Swarm Intelligence</h2>
            <p className="text-xs text-gray-500 font-mono">vLLM ORCHESTRATOR // {agents.length} AGENTS ONLINE</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs font-mono">
            <span className="text-green-400">● LOCALHOST:8000</span>
            <span className="text-gray-600">|</span>
            <span className="text-blue-400">LATENCY: &lt;1ms</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        
        {/* Visual Swarm Graph */}
        <div className="bg-black/40 border border-gray-800 rounded-lg p-8 relative flex flex-col items-center justify-center gap-12 overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 opacity-10" 
                style={{backgroundImage: 'radial-gradient(#4a5568 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
           </div>

           {/* Overlord Node */}
           <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`p-6 rounded-full border border-purple-500/50 transition-all duration-300 ${getStatusColor(agents[0].status)}`}>
                  {getIcon('OVERLORD')}
              </div>
              <span className="font-bold text-purple-400 text-sm">OVERLORD (Head Agent)</span>
           </div>

           {/* Worker Nodes */}
           <div className="flex gap-8 flex-wrap justify-center relative z-10 w-full">
              {/* Connector Lines (Visual CSS trick) */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[80%] h-12 border-t border-l border-r border-gray-700 rounded-t-3xl -z-10"></div>

              {agents.slice(1).map((agent) => (
                  <div key={agent.id} className="flex flex-col items-center gap-2 group">
                      {/* Connection Line Vertical */}
                      <div className={`h-4 w-0.5 mb-1 transition-all ${agent.status === 'THINKING' ? 'bg-purple-500 h-6' : 'bg-gray-800'}`}></div>

                      <div className={`p-4 rounded-full border border-gray-700 transition-all duration-300 ${getStatusColor(agent.status)}`}>
                        {getIcon(agent.role)}
                      </div>
                      <div className="text-center">
                          <div className="font-bold text-gray-300 text-xs">{agent.role}</div>
                          <div className="text-[10px] text-gray-500">{agent.name}</div>
                      </div>
                  </div>
              ))}
           </div>
        </div>

        {/* Task Log */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
           <div className="p-3 border-b border-gray-800 bg-black/40 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Swarm Operations Log</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {tasks.length === 0 && (
                  <div className="text-gray-600 text-center mt-10">System Idle. Awaiting prompts for decomposition.</div>
              )}
              {tasks.map((task) => (
                  <div key={task.id} className="flex gap-3 animate-fade-in">
                      <div className="min-w-[70px] text-gray-500 text-right">
                          {task.assignedTo}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                              <span className={`w-2 h-2 rounded-full ${
                                  task.status === 'COMPLETED' ? 'bg-green-500' : 
                                  task.status === 'IN_PROGRESS' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'
                              }`} />
                              <span className="text-gray-300">{task.description}</span>
                          </div>
                          {task.result && (
                              <div className="ml-4 p-2 bg-black/50 border-l-2 border-purple-500 text-purple-300 rounded-sm">
                                  {task.result}
                              </div>
                          )}
                      </div>
                  </div>
              ))}
           </div>
           
           <div className="p-2 border-t border-gray-800 bg-black/40 text-[10px] text-gray-500 flex justify-between">
              <span>TASKS PENDING: {tasks.filter(t => t.status === 'PENDING').length}</span>
              <span>TASKS COMPLETED: {tasks.filter(t => t.status === 'COMPLETED').length}</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SwarmControlTool;
