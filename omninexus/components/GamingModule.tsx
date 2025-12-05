
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Sparkles, Map, Database, Code, Library, Zap, Feather, Gem, BookOpen, PieChart } from 'lucide-react';
import { TcgGame, CurvePoint, DeckStat } from '../types';
import CollectionTracker from './tools/CollectionTracker';

// --- MOCK DATA FOR GAMES ---

const DATA_MTG: CurvePoint[] = [
  { cost: '0', count: 2 }, { cost: '1', count: 8 }, { cost: '2', count: 14 },
  { cost: '3', count: 12 }, { cost: '4', count: 8 }, { cost: '5', count: 6 }, { cost: '6+', count: 4 },
];

const DATA_POKEMON: CurvePoint[] = [
  { cost: 'Pokemon', count: 18 }, { cost: 'Trainer', count: 30 }, { cost: 'Energy', count: 12 }
];

const DATA_LORCANA: CurvePoint[] = [
  { cost: '1', count: 8 }, { cost: '2', count: 12 }, { cost: '3', count: 14 },
  { cost: '4', count: 10 }, { cost: '5', count: 8 }, { cost: '6', count: 4 }, { cost: '7+', count: 4 },
];

const DATA_FFTCG: CurvePoint[] = [
  { cost: '1', count: 4 }, { cost: '2', count: 12 }, { cost: '3', count: 14 },
  { cost: '4', count: 12 }, { cost: '5', count: 8 }, { cost: '6', count: 6 }, { cost: '7+', count: 4 },
];

// --- CONFIGURATIONS ---

const GAME_CONFIG: Record<TcgGame, {
  label: string;
  icon: React.ElementType;
  colors: string[];
  chartLabel: string;
  stats: DeckStat[];
  integrations: { name: string; desc: string; icon: React.ElementType }[];
  primaryColor: string;
  accentColor: string;
}> = {
  MTG: {
    label: 'Magic: The Gathering',
    icon: Sparkles,
    colors: ['#e2e8f0', '#f0f2c0', '#b3ceea', '#a69f9d', '#eb9f82', '#c4d3ca', '#f6e05e'],
    chartLabel: 'Mana Curve (CMC)',
    stats: [
      { label: 'AVG_CMC', value: '2.84' },
      { label: 'LANDS', value: '34' },
      { label: 'FORMAT', value: 'Commander (100)' }
    ],
    integrations: [
      { name: 'Commander Spellbook', desc: 'Infinite combo database', icon: Database },
      { name: 'Scryfall Proxy', desc: 'Card data & imagery', icon: Map },
    ],
    primaryColor: 'text-blue-300',
    accentColor: 'border-blue-500'
  },
  POKEMON: {
    label: 'Pokémon TCG',
    icon: Zap,
    colors: ['#FCA5A5', '#93C5FD', '#FCD34D'], // Red, Blue, Yellowish
    chartLabel: 'Deck Composition',
    stats: [
      { label: 'SUPPORTERS', value: '12' },
      { label: 'ITEMS', value: '18' },
      { label: 'FORMAT', value: 'Standard (60)' }
    ],
    integrations: [
      { name: 'PokéAPI', desc: 'Meta analysis data', icon: Database },
      { name: 'LimitlessTCG', desc: 'Tournament decklists', icon: Code },
    ],
    primaryColor: 'text-yellow-400',
    accentColor: 'border-yellow-500'
  },
  LORCANA: {
    label: 'Disney Lorcana',
    icon: Feather,
    colors: ['#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'], // Golds/Inks
    chartLabel: 'Ink Cost Curve',
    stats: [
      { label: 'UNINKABLES', value: '8' },
      { label: 'SONGS', value: '12' },
      { label: 'FORMAT', value: 'Core (60)' }
    ],
    integrations: [
      { name: 'Inkborn', desc: 'Card database', icon: Library },
      { name: 'Pixelborn (Sim)', desc: 'Match history import', icon: Code },
    ],
    primaryColor: 'text-orange-300',
    accentColor: 'border-orange-500'
  },
  FFTCG: {
    label: 'Final Fantasy TCG',
    icon: Gem,
    colors: ['#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490', '#155E75'], // Crystals
    chartLabel: 'CP Cost Curve',
    stats: [
      { label: 'BACKUPS', value: '16' },
      { label: 'EX BURSTS', value: '9' },
      { label: 'FORMAT', value: 'Standard (50)' }
    ],
    integrations: [
      { name: 'FFDecks', desc: 'Meta tier lists', icon: Database },
      { name: 'Mognet', desc: 'Card search engine', icon: Map },
    ],
    primaryColor: 'text-cyan-300',
    accentColor: 'border-cyan-500'
  }
};

const GamingModule: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<TcgGame>('MTG');
  const [viewMode, setViewMode] = useState<'ANALYTICS' | 'COLLECTION'>('ANALYTICS');

  const activeConfig = GAME_CONFIG[selectedGame];

  const getChartData = () => {
    switch (selectedGame) {
      case 'MTG': return DATA_MTG;
      case 'POKEMON': return DATA_POKEMON;
      case 'LORCANA': return DATA_LORCANA;
      case 'FFTCG': return DATA_FFTCG;
      default: return DATA_MTG;
    }
  };

  const data = getChartData();

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-4">
        <div>
          <h2 className={`text-3xl font-bold tracking-tighter flex items-center gap-2 ${activeConfig.primaryColor}`}>
            <activeConfig.icon className="w-8 h-8" />
            ARCANE_LIBRARY
          </h2>
          <p className="text-gray-400 text-sm font-mono mt-1">
             Collection Manager // {activeConfig.label}
          </p>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          {/* Game Selector */}
          <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
             {(Object.keys(GAME_CONFIG) as TcgGame[]).map((game) => {
               const Icon = GAME_CONFIG[game].icon;
               return (
                  <button
                    key={game}
                    onClick={() => setSelectedGame(game)}
                    className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedGame === game 
                        ? 'bg-gray-800 text-white border border-gray-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{game}</span>
                  </button>
               );
             })}
          </div>

          {/* View Toggle */}
           <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setViewMode('ANALYTICS')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'ANALYTICS' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <PieChart className="w-3 h-3" /> Deck Analytics
              </button>
              <button
                onClick={() => setViewMode('COLLECTION')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'COLLECTION' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <BookOpen className="w-3 h-3" /> Collection Binder
              </button>
           </div>
        </div>
      </div>

      {viewMode === 'COLLECTION' ? (
        <CollectionTracker selectedGame={selectedGame} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          
          {/* Deck Analytics Chart */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold text-gray-200 border-l-4 pl-3 ${activeConfig.accentColor}`}>
                {activeConfig.chartLabel}
              </h3>
              <div className="flex gap-2 text-[10px] font-mono text-gray-500">
                 {activeConfig.stats.map(s => (
                   <span key={s.label} className="bg-black/30 px-2 py-1 rounded border border-gray-800">
                     {s.label}: <span className="text-gray-300">{s.value}</span>
                   </span>
                 ))}
              </div>
            </div>
            
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="cost" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '4px' }}
                    itemStyle={{ color: '#e2e8f0', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={activeConfig.colors[index % activeConfig.colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tools & Integrations Column */}
          <div className="flex flex-col gap-4">
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Library className="w-4 h-4" /> Active Deck
               </h4>
               <div className="p-3 bg-black/40 rounded border border-gray-800 mb-2">
                  <div className="text-sm font-bold text-gray-200">
                     {selectedGame === 'MTG' ? 'Ur-Dragon Tribal' :
                      selectedGame === 'POKEMON' ? 'Charizard ex' :
                      selectedGame === 'LORCANA' ? 'Ruby/Amethyst Bounce' :
                      'Cloud Strife Midrange'}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-1">Last edited: 2 hours ago</div>
               </div>
               <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors">
                 EDIT LIST
               </button>
            </div>

            <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-y-auto">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Integrations</h4>
              <div className="space-y-3">
                {activeConfig.integrations.map((tool, i) => (
                  <div key={i} className={`p-3 rounded-lg border border-gray-800 bg-black/20 hover:border-gray-500 cursor-pointer transition-all group`}>
                     <div className="flex items-center gap-3 mb-1">
                        <tool.icon className={`w-5 h-5 text-gray-500 group-hover:${activeConfig.primaryColor.replace('text-', 'text-')}`} />
                        <div className="text-sm font-bold text-gray-300 group-hover:text-white">{tool.name}</div>
                     </div>
                     <p className="text-xs text-gray-500 pl-8">{tool.desc}</p>
                  </div>
                ))}
                 <div className="p-3 rounded-lg border border-dashed border-gray-800 hover:border-gray-600 cursor-pointer text-center text-xs text-gray-500 transition-all">
                    + Add Custom Tool
                 </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default GamingModule;
