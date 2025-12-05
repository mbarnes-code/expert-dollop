
import React, { useState } from 'react';
import { Briefcase, Wallet, Utensils, Monitor, Calendar } from 'lucide-react';
import BudgetTrackerTool from './tools/BudgetTrackerTool';
import UnifiedCalendarTool from './tools/UnifiedCalendarTool';

const ProductivityModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<'BUDGET' | 'RECIPES' | 'WORKFLOW' | 'CALENDAR'>('CALENDAR');

  const renderContent = () => {
    switch (currentView) {
      case 'BUDGET':
        return <BudgetTrackerTool />;
      case 'CALENDAR':
        return <UnifiedCalendarTool />;
      default:
        return <div className="p-10 text-center text-gray-500">Module Under Construction</div>;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      <header className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-green-400 tracking-tighter flex items-center gap-2">
            <Briefcase className="w-8 h-8" />
            LIFE_OS
          </h2>
          <p className="text-gray-400 text-sm font-mono mt-1">Productivity // Finance // Automation</p>
        </div>
        
        <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
           <button 
             onClick={() => setCurrentView('CALENDAR')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'CALENDAR' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Calendar className="w-4 h-4" /> Calendar
           </button>
           <button 
             onClick={() => setCurrentView('BUDGET')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'BUDGET' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Wallet className="w-4 h-4" /> Actual Budget
           </button>
           <button 
             onClick={() => setCurrentView('RECIPES')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'RECIPES' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Utensils className="w-4 h-4" /> Mealie
           </button>
           <button 
             onClick={() => setCurrentView('WORKFLOW')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'WORKFLOW' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Monitor className="w-4 h-4" /> KasmVNC
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductivityModule;
