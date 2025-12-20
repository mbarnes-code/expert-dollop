import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Search, Database, Calendar, Filter, Download, MoreHorizontal, AlertCircle, Terminal, Activity } from 'lucide-react';
import { HelkLogEntry } from '../../types';
import { MOCK_HELK_LOGS } from '../../services/mockDataStore';

const HISTOGRAM_DATA = [
  { time: '14:00', count: 12 },
  { time: '14:05', count: 18 },
  { time: '14:10', count: 15 },
  { time: '14:15', count: 45 },
  { time: '14:20', count: 80 },
  { time: '14:25', count: 65 },
  { time: '14:30', count: 30 },
];

const HELKTool: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<HelkLogEntry[]>(MOCK_HELK_LOGS);

  // Sync with store if needed, or just load initial
  useEffect(() => {
    setLogs(MOCK_HELK_LOGS);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = MOCK_HELK_LOGS.filter(log => 
      log.process_name.toLowerCase().includes(query) ||
      log.message.toLowerCase().includes(query) ||
      log.source_ip.includes(query) ||
      log.event_id.toString().includes(query)
    );
    setLogs(filtered);
  };

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'ERROR': return 'text-red-400 bg-red-900/20 border-red-900/50';
      case 'WARN': return 'text-yellow-400 bg-yellow-900/20 border-yellow-900/50';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-900/50';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header / Kibana Top Bar */}
      <div className="flex flex-col gap-4 bg-gray-900 border border-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg">
                <Database className="w-6 h-6 text-blue-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-100">HELK Dashboard</h2>
                <p className="text-xs text-gray-500 font-mono">ELASTICSEARCH // KIBANA // HUNTING</p>
            </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-1 transition-all">
                    <Calendar className="w-3 h-3" /> Last 15 Minutes
                </button>
                <button className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium border border-gray-700 transition-all">
                    Auto-refresh
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-black/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black focus:border-blue-500 sm:text-sm font-mono"
                placeholder='Search logs (e.g. process_name: "powershell" OR event_id: 4624)...'
                value={searchQuery}
                onChange={handleSearch}
            />
             <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50 hover:bg-blue-900/50">KQL</button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Visualization Row */}
        <div className="h-48 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                     <Activity className="w-4 h-4" /> Events over time
                 </h3>
                 <MoreHorizontal className="w-4 h-4 text-gray-600 cursor-pointer" />
            </div>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HISTOGRAM_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                    <XAxis dataKey="time" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '4px' }}
                        itemStyle={{ color: '#63b3ed' }}
                    />
                    <Bar dataKey="count" fill="#4299e1" radius={[2, 2, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Documents
                </h3>
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-800 rounded"><Filter className="w-4 h-4 text-gray-500" /></button>
                    <button className="p-1 hover:bg-gray-800 rounded"><Download className="w-4 h-4 text-gray-500" /></button>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-black/40 sticky top-0">
                        <tr>
                            <th className="p-3 text-gray-500 font-medium w-10"></th>
                            <th className="p-3 text-gray-500 font-medium">Time</th>
                            <th className="p-3 text-gray-500 font-medium">Severity</th>
                            <th className="p-3 text-gray-500 font-medium">Event ID</th>
                            <th className="p-3 text-gray-500 font-medium">Source / Process</th>
                            <th className="p-3 text-gray-500 font-medium">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                <td className="p-3 text-gray-600"><input type="checkbox" className="rounded bg-gray-800 border-gray-700" /></td>
                                <td className="p-3 text-blue-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getSeverityColor(log.severity)}`}>
                                        {log.severity}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-300">{log.event_id}</td>
                                <td className="p-3 text-gray-300">
                                    <div className="flex flex-col">
                                        <span className="text-purple-400">{log.process_name}</span>
                                        <span className="text-gray-500 text-[10px]">{log.source_ip}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-gray-400 truncate max-w-md" title={log.message}>
                                    {log.message}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No logs found matching query.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-2 border-t border-gray-800 bg-black/40 text-[10px] text-gray-500 flex justify-between">
                <span>Hits: {logs.length}</span>
                <span>Index: winlogbeat-*</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default HELKTool;
