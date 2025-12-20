import React, { useState, useEffect } from 'react';
import { MispEvent } from '../../types';
import { Globe, Share2, ShieldAlert, FileText, Tag, Filter, Plus, Radio, Eye } from 'lucide-react';
import { MOCK_MISP_EVENTS } from '../../services/mockDataStore';

const MISPTool: React.FC = () => {
  const [events, setEvents] = useState<MispEvent[]>(MOCK_MISP_EVENTS);
  const [filterText, setFilterText] = useState('');

  // Sync with store
  useEffect(() => {
    setEvents(MOCK_MISP_EVENTS);
  }, []);

  const getThreatLevelBadge = (level: string) => {
    switch(level) {
      case '1': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">High</span>;
      case '2': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">Medium</span>;
      case '3': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white">Low</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500 text-white">Undefined</span>;
    }
  };

  const getAnalysisStatus = (status: string) => {
    switch(status) {
      case '0': return <span className="text-gray-400">Initial</span>;
      case '1': return <span className="text-yellow-400">Ongoing</span>;
      case '2': return <span className="text-green-400">Completed</span>;
      default: return <span className="text-gray-500">Unknown</span>;
    }
  };

  const getTlpColor = (tag: string) => {
    if (tag.includes('white')) return 'bg-white text-black';
    if (tag.includes('green')) return 'bg-green-500 text-white';
    if (tag.includes('amber')) return 'bg-yellow-500 text-black';
    if (tag.includes('red')) return 'bg-red-600 text-white';
    return 'bg-blue-900/40 text-blue-300 border-blue-800';
  };

  // Filter Logic
  const filteredEvents = events.filter(evt => 
    evt.info.toLowerCase().includes(filterText.toLowerCase()) ||
    evt.id.includes(filterText) ||
    evt.tags.some(t => t.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex flex-col gap-4 bg-gray-900 border border-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <Globe className="w-6 h-6 text-gray-200" />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    MISP <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-gray-800 rounded-full">v2.4.177</span>
                  </h2>
                  <p className="text-xs text-gray-500 font-mono">MALWARE INFORMATION SHARING PLATFORM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 mr-4">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs text-green-400 font-mono">SYNC_ACTIVE</span>
               </div>
               <button className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-white rounded font-medium border border-gray-600 transition-all flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Add Event
               </button>
            </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-2 bg-black/30 rounded border border-gray-800">
           <Filter className="w-4 h-4 text-gray-500 ml-2" />
           <input 
             type="text" 
             placeholder="Filter events by ID, Info, or Tag..." 
             className="bg-transparent border-none text-sm text-gray-300 focus:ring-0 w-full focus:outline-none"
             value={filterText}
             onChange={(e) => setFilterText(e.target.value)}
           />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* Main Event Table */}
        <div className="col-span-9 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
           <div className="p-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Event Index
              </h3>
              <span className="text-xs text-gray-600">Showing {filteredEvents.length} events</span>
           </div>

           <div className="flex-1 overflow-auto">
             <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-gray-500 font-medium sticky top-0">
                  <tr>
                    <th className="p-3 w-16">ID</th>
                    <th className="p-3 w-24">Date</th>
                    <th className="p-3 w-32">Org</th>
                    <th className="p-3 w-24">Level</th>
                    <th className="p-3">Event Info</th>
                    <th className="p-3 w-24">Tags</th>
                    <th className="p-3 w-20 text-center">Attr.</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-white/5 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-blue-500">
                      <td className="p-3 font-mono text-blue-400">{evt.id}</td>
                      <td className="p-3 text-gray-400">{evt.date}</td>
                      <td className="p-3 font-bold text-gray-300">{evt.org}</td>
                      <td className="p-3">{getThreatLevelBadge(evt.threat_level_id)}</td>
                      <td className="p-3">
                        <div className="text-gray-200 font-medium">{evt.info}</div>
                        <div className="text-[10px] text-gray-500 mt-1 flex gap-2">
                           <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {evt.distribution}</span>
                           <span className="flex items-center gap-1"><Radio className="w-3 h-3" /> {getAnalysisStatus(evt.analysis)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {evt.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] border border-transparent ${getTlpColor(tag)}`}>
                              {tag.split(':')[1] || tag}
                            </span>
                          ))}
                          {evt.tags.length > 3 && <span className="text-[10px] text-gray-500">+{evt.tags.length - 3}</span>}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                         <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-[10px] font-bold">{evt.attribute_count}</span>
                      </td>
                      <td className="p-3">
                        <button className="p-1 hover:bg-blue-600/20 hover:text-blue-400 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>

        {/* Right Sidebar: Feeds & Galaxies */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          
          {/* Connected Feeds */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex-1">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Threat Feeds
             </h3>
             <div className="space-y-3">
                {[
                  { name: 'CIRCL OSINT', status: 'active', last: '2m ago' },
                  { name: 'AlienVault OTX', status: 'active', last: '15m ago' },
                  { name: 'Botvrij.eu', status: 'warning', last: '2h ago' },
                  { name: 'DigitalSide', status: 'active', last: '5m ago' }
                ].map((feed, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-black/20 border border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${feed.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-sm font-medium text-gray-300">{feed.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{feed.last}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Quick Tags / Taxonomy */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-1/2">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Top Tags
             </h3>
             <div className="flex flex-wrap gap-2">
                {['tlp:white', 'tlp:amber', 'malware', 'ransomware', 'phishing', 'APT', 'finance', 'osint', 'internal', 'brute-force'].map((tag, i) => (
                   <span key={i} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-gray-500 cursor-pointer transition-colors">
                     {tag}
                   </span>
                ))}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MISPTool;
