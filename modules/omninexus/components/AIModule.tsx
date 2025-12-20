
import React, { useState } from 'react';
import { Bot, Workflow, Globe, Settings, Brain } from 'lucide-react';
import WorkflowBuilderTool from './tools/WorkflowBuilderTool';
import WebCrawlerTool from './tools/WebCrawlerTool';

const AIModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<'WORKFLOW' | 'CRAWLER' | 'SETTINGS'>('WORKFLOW');

  const renderContent = () => {
    switch(currentView) {
      case 'WORKFLOW':
        return <WorkflowBuilderTool />;
      case 'CRAWLER':
        return <WebCrawlerTool />;
      default:
        return <WorkflowBuilderTool />; // Default to workflow
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in">
      <header className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-purple-400 tracking-tighter flex items-center gap-2">
            <Bot className="w-8 h-8" />
            NEXUS_LAB
          </h2>
          <p className="text-gray-400 text-sm font-mono mt-1">AI Automation // Web Scraping // Intelligence</p>
        </div>
        
        {/* Module Navigation */}
        <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
           <button 
             onClick={() => setCurrentView('WORKFLOW')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'WORKFLOW' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Workflow className="w-4 h-4" /> Workflows
           </button>
           <button 
             onClick={() => setCurrentView('CRAWLER')}
             className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'CRAWLER' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Globe className="w-4 h-4" /> Web Crawler
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default AIModule;