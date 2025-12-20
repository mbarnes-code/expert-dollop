

import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarEventType } from '../../types';
import { getAggregatedCalendarEvents } from '../../services/mockDataStore';
import { googleCalendarService } from '../../services/googleCalendarService';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, Wifi, DollarSign, ShieldAlert, Gamepad2, Wrench, ArrowUp, ArrowDown, Clock, LayoutGrid, List, AlignJustify } from 'lucide-react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

type CalendarMode = 'FINANCE' | 'CYBER' | 'GAMING' | 'INFRA' | 'ALL';
type ViewMode = 'MONTH' | 'WEEK' | 'DAY';

const UnifiedCalendarTool: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'OFFLINE'>('IDLE');
  const [mode, setMode] = useState<CalendarMode>('FINANCE');
  const [view, setView] = useState<ViewMode>('MONTH');

  useEffect(() => {
    const data = getAggregatedCalendarEvents();
    setEvents(data);
  }, []);

  const handleSync = async () => {
    setSyncStatus('SYNCING');
    const result = await googleCalendarService.syncEvents(events);
    setSyncStatus(result.status);
    setTimeout(() => setSyncStatus('IDLE'), 3000);
  };

  const getEventsForDay = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  const navigate = (delta: number) => {
    const newDate = new Date(currentDate);
    if (view === 'MONTH') {
      newDate.setMonth(newDate.getMonth() + delta);
    } else if (view === 'WEEK') {
      newDate.setDate(newDate.getDate() + (delta * 7));
    } else {
      newDate.setDate(newDate.getDate() + delta);
      setSelectedDay(newDate.toISOString().split('T')[0]); // Update selection on day nav
    }
    setCurrentDate(newDate);
  };

  // --- Metrics Helper ---
  const getDayMetrics = (dateStr: string) => {
      const dayEvents = getEventsForDay(dateStr);
      let score = 0;
      let positive = 0;
      let negative = 0;

      if (mode === 'FINANCE') {
          dayEvents.filter(e => e.type === 'TRANSACTION').forEach(e => {
              if (e.meta?.amount > 0) positive += e.meta.amount;
              else negative += Math.abs(e.meta.amount || 0);
          });
          score = positive + negative;
      } else if (mode === 'CYBER') {
          dayEvents.filter(e => e.type === 'CYBER_INCIDENT').forEach(e => {
              negative += e.meta?.severity === 'HIGH' ? 10 : 2;
          });
      } else if (mode === 'GAMING') {
          dayEvents.filter(e => e.type === 'TCG_EVENT').forEach(e => positive += 1);
      } else if (mode === 'INFRA') {
          dayEvents.filter(e => e.type === 'INFRA_MAINTENANCE').forEach(e => negative += 1);
      } else {
          positive = dayEvents.length;
      }
      return { positive, negative, score, events: dayEvents };
  };

  // --- RENDERERS ---

  const renderMonthView = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      
      const dayCells = Array(firstDay).fill(null);
      for (let i = 1; i <= daysInMonth; i++) {
        dayCells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
      }

      return (
          <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-7 mb-2">
                  {DAYS.map((d, i) => (
                      <div key={i} className="text-center text-xs text-gray-500 font-bold uppercase">{d}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7 gap-1 flex-1 content-start auto-rows-fr">
                  {dayCells.map((dateStr, idx) => {
                      if (!dateStr) return <div key={`empty-${idx}`} className="bg-transparent" />;
                      
                      const dayNum = parseInt(dateStr.split('-')[2]);
                      const metrics = getDayMetrics(dateStr);
                      const isSelected = selectedDay === dateStr;
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;

                      return (
                          <div 
                             key={dateStr}
                             onClick={() => setSelectedDay(dateStr)}
                             className={`
                                relative min-h-[80px] rounded border flex flex-col justify-between p-1 cursor-pointer transition-all overflow-hidden
                                ${isSelected ? 'bg-blue-900/20 border-blue-500 z-10' : 'bg-black/20 border-gray-800 hover:bg-gray-800'}
                             `}
                          >
                             <span className={`text-xs font-bold ${isToday ? 'text-blue-400' : 'text-gray-500'}`}>{dayNum}</span>
                             
                             <div className="flex gap-1 items-end h-10 w-full px-1">
                                {mode === 'FINANCE' && metrics.positive > 0 && (
                                    <div className="flex-1 bg-blue-500 opacity-80 rounded-t-sm" style={{ height: `${Math.min(metrics.positive/50, 100)}%` }} title={`Income: $${metrics.positive}`}></div>
                                )}
                                {mode === 'FINANCE' && metrics.negative > 0 && (
                                    <div className="flex-1 bg-red-500 opacity-80 rounded-t-sm" style={{ height: `${Math.min(metrics.negative/2, 100)}%` }} title={`Spent: $${metrics.negative}`}></div>
                                )}
                                {mode === 'CYBER' && metrics.negative > 0 && (
                                    <div className="w-full bg-red-600 opacity-90 rounded-t-sm" style={{ height: '60%' }}></div>
                                )}
                                {mode === 'GAMING' && metrics.positive > 0 && (
                                    <div className="w-full bg-purple-500 opacity-90 rounded-t-sm" style={{ height: '60%' }}></div>
                                )}
                                {mode === 'INFRA' && metrics.negative > 0 && (
                                    <div className="w-full bg-orange-500 opacity-90 rounded-t-sm" style={{ height: '60%' }}></div>
                                )}
                             </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const renderWeekView = () => {
      // Find start of week (Sunday)
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const weekDays = Array.from({length: 7}, (_, i) => {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          return d.toISOString().split('T')[0];
      });

      return (
          <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-hidden">
             <div className="grid grid-cols-7 gap-4 h-full">
                 {weekDays.map((dateStr) => {
                     const date = new Date(dateStr);
                     const isToday = new Date().toISOString().split('T')[0] === dateStr;
                     const isSelected = selectedDay === dateStr;
                     const metrics = getDayMetrics(dateStr);

                     return (
                         <div 
                            key={dateStr} 
                            onClick={() => setSelectedDay(dateStr)}
                            className={`flex flex-col h-full border rounded-lg transition-all cursor-pointer overflow-hidden ${isSelected ? 'border-blue-500 bg-blue-900/10' : 'border-gray-800 bg-black/20 hover:border-gray-600'}`}
                         >
                             <div className={`p-2 text-center border-b border-gray-800 ${isToday ? 'bg-blue-900/30' : 'bg-black/30'}`}>
                                 <div className="text-[10px] text-gray-500 uppercase">{FULL_DAYS[date.getDay()].substring(0,3)}</div>
                                 <div className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-gray-200'}`}>{date.getDate()}</div>
                             </div>
                             <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                                 {metrics.events.length === 0 && <div className="text-[10px] text-gray-600 text-center mt-4">-</div>}
                                 {metrics.events.map(evt => (
                                     <div key={evt.id} className="text-[10px] p-1.5 rounded bg-gray-800 border border-gray-700 truncate" title={evt.title}>
                                         <div className="flex items-center gap-1 mb-0.5">
                                             <div className={`w-1.5 h-1.5 rounded-full ${
                                                 evt.type === 'TRANSACTION' ? (evt.meta?.amount > 0 ? 'bg-blue-400' : 'bg-red-400') :
                                                 evt.type === 'CYBER_INCIDENT' ? 'bg-red-500' :
                                                 evt.type === 'TCG_EVENT' ? 'bg-purple-400' : 'bg-orange-400'
                                             }`} />
                                             <span className="font-mono text-gray-500">{evt.time || 'All Day'}</span>
                                         </div>
                                         <span className="text-gray-300">{evt.title}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )
                 })}
             </div>
          </div>
      )
  };

  const renderDayView = () => {
      // Use selectedDay or currentDate if not set
      const targetDate = selectedDay || currentDate.toISOString().split('T')[0];
      const metrics = getDayMetrics(targetDate);
      const displayDate = new Date(targetDate);

      return (
          <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
             <div className="p-4 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-bold text-gray-200">{FULL_DAYS[displayDate.getDay()]}</h3>
                    <p className="text-sm text-gray-500">{displayDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                 </div>
                 <div className="text-right">
                     <div className="text-xs text-gray-400 font-bold uppercase">Daily Density</div>
                     <div className="flex gap-4 mt-1">
                         <div className="text-xs"><span className="text-blue-400 font-bold">{metrics.positive}</span> <span className="text-gray-600">Pos</span></div>
                         <div className="text-xs"><span className="text-red-400 font-bold">{metrics.negative}</span> <span className="text-gray-600">Neg</span></div>
                     </div>
                 </div>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-black/10">
                 {HOURS.map(hour => (
                     <div key={hour} className="flex border-b border-gray-800/50 min-h-[60px] group hover:bg-white/5">
                         <div className="w-16 p-2 text-right text-xs text-gray-500 font-mono border-r border-gray-800 bg-black/20">
                             {String(hour).padStart(2,'0')}:00
                         </div>
                         <div className="flex-1 relative p-1">
                             {/* Place events for this hour */}
                             {metrics.events.filter(e => e.time && parseInt(e.time.split(':')[0]) === hour).map(evt => (
                                 <div key={evt.id} className="mb-1 flex items-center gap-2 p-2 rounded bg-gray-800/80 border border-gray-700 text-xs shadow-sm">
                                      <div className={`w-2 h-8 rounded-sm ${
                                          evt.type === 'TRANSACTION' ? 'bg-green-500' :
                                          evt.type === 'CYBER_INCIDENT' ? 'bg-red-500' :
                                          evt.type === 'TCG_EVENT' ? 'bg-purple-500' : 'bg-orange-500'
                                      }`} />
                                      <div>
                                          <div className="font-bold text-gray-200 flex items-center gap-2">
                                              {evt.time} <span className="text-gray-600">|</span> {evt.title}
                                          </div>
                                          <div className="text-gray-500">{evt.description}</div>
                                      </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      )
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-900/20 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Unified Calendar</h2>
            <p className="text-xs text-gray-500 font-mono uppercase">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} // {view} VIEW
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
             {/* View Switcher */}
             <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
                <button onClick={() => setView('MONTH')} className={`p-2 rounded text-xs font-bold transition-all ${view === 'MONTH' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`} title="Month View"><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setView('WEEK')} className={`p-2 rounded text-xs font-bold transition-all ${view === 'WEEK' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`} title="Week View"><AlignJustify className="w-4 h-4" /></button>
                <button onClick={() => setView('DAY')} className={`p-2 rounded text-xs font-bold transition-all ${view === 'DAY' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`} title="Day View"><List className="w-4 h-4" /></button>
             </div>

             {/* Mode Switcher */}
             <div className="hidden lg:flex bg-black/50 p-1 rounded-lg border border-gray-800">
                {[
                    { id: 'FINANCE', icon: DollarSign, label: 'Finance' },
                    { id: 'CYBER', icon: ShieldAlert, label: 'Cyber' },
                    { id: 'GAMING', icon: Gamepad2, label: 'Gaming' },
                    { id: 'INFRA', icon: Wrench, label: 'Infra' }
                ].map((m) => (
                    <button 
                        key={m.id}
                        onClick={() => setMode(m.id as CalendarMode)}
                        className={`p-2 rounded flex items-center gap-2 text-xs font-bold transition-all ${mode === m.id ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <m.icon className="w-3 h-3" /> <span className="hidden xl:inline">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* Sync */}
            <button 
                onClick={handleSync}
                className="hidden md:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-gray-800 hover:border-gray-600 transition-colors"
            >
                {syncStatus === 'SYNCING' ? <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" /> : <Wifi className="w-3 h-3 text-blue-500" />}
                <span className="text-[10px] font-mono text-gray-400">{syncStatus}</span>
            </button>
            
            {/* Nav */}
            <div className="flex gap-1">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded text-gray-400 border border-transparent hover:border-gray-700"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date().toISOString().split('T')[0]); }} className="px-3 text-xs font-bold hover:bg-gray-800 rounded text-gray-400 border border-transparent hover:border-gray-700">Today</button>
                <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-800 rounded text-gray-400 border border-transparent hover:border-gray-700"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4 overflow-hidden">
         
         {/* Primary Calendar View */}
         <div className="xl:col-span-3 h-full overflow-hidden">
             {view === 'MONTH' && renderMonthView()}
             {view === 'WEEK' && renderWeekView()}
             {view === 'DAY' && renderDayView()}
         </div>

         {/* Static Day View (Sidebar) */}
         <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-gray-800 bg-black/40">
                <h3 className="text-sm font-bold text-gray-200">
                    {selectedDay ? new Date(selectedDay).toDateString() : 'Select a date'}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Selected Day Detail</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {selectedDayEvents.length === 0 && (
                    <div className="text-center text-gray-600 mt-10">
                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        No events found for this day.
                    </div>
                )}
                {selectedDayEvents.sort((a,b) => (a.time || '').localeCompare(b.time || '')).map(evt => (
                    <div key={evt.id} className="p-3 rounded bg-black/20 border border-gray-800 hover:border-gray-600 transition-all group">
                        <div className="flex items-center gap-2 mb-1">
                            {/* Icon based on type */}
                            {evt.type === 'TRANSACTION' && <DollarSign className={`w-3 h-3 ${evt.meta?.amount > 0 ? 'text-blue-400' : 'text-red-400'}`} />}
                            {evt.type === 'CYBER_INCIDENT' && <ShieldAlert className="w-3 h-3 text-red-500" />}
                            {evt.type === 'TCG_EVENT' && <Gamepad2 className="w-3 h-3 text-purple-400" />}
                            {evt.type === 'INFRA_MAINTENANCE' && <Wrench className="w-3 h-3 text-orange-400" />}
                            
                            <span className="text-xs font-bold text-gray-300 group-hover:text-white truncate">{evt.title}</span>
                        </div>
                        
                        <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{evt.description}</p>
                        
                        <div className="flex justify-between items-center text-[10px] font-mono border-t border-gray-800 pt-2 mt-2">
                             <span className="text-gray-400">{evt.time || 'All Day'}</span>
                             {evt.type === 'TRANSACTION' && (
                                 <span className={evt.meta?.amount > 0 ? 'text-blue-400 font-bold' : 'text-red-400 font-bold'}>
                                     {evt.meta?.amount > 0 ? '+' : ''}${Math.abs(evt.meta?.amount).toFixed(2)}
                                 </span>
                             )}
                             {evt.type !== 'TRANSACTION' && <span className="text-gray-600">{evt.source}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default UnifiedCalendarTool;
