
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { ChefHat, Trash2, PieChart as PieIcon, BarChart as BarIcon, List, AlertCircle } from 'lucide-react';
import { SavedRecipe } from '../../types';
import { OPERATIONS } from './CyberChefTool';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CyberChefRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);

  useEffect(() => {
    // Load from localStorage or mock if empty
    const stored = localStorage.getItem('cyberchef_recipes');
    if (stored) {
      setRecipes(JSON.parse(stored));
    } else {
      // Seed some mock data if empty for visualization
      const mocks: SavedRecipe[] = [
        { 
            id: 'mock1', name: 'Basic Base64 Decode', timestamp: Date.now() - 100000,
            items: [{ id: '1', opId: 'from_base64' }] 
        },
        { 
            id: 'mock2', name: 'Malware Unpacker', timestamp: Date.now() - 50000,
            items: [{ id: '1', opId: 'from_base64' }, { id: '2', opId: 'reverse' }, { id: '3', opId: 'from_hex' }] 
        },
        { 
            id: 'mock3', name: 'URL Cleaner', timestamp: Date.now(),
            items: [{ id: '1', opId: 'url_decode' }] 
        }
      ];
      setRecipes(mocks);
      localStorage.setItem('cyberchef_recipes', JSON.stringify(mocks));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    localStorage.setItem('cyberchef_recipes', JSON.stringify(updated));
  };

  // --- Process Data for Charts ---

  // 1. Operation Frequency (Bar Chart)
  const opCounts: Record<string, number> = {};
  recipes.forEach(r => {
    r.items.forEach(item => {
        const op = OPERATIONS.find(o => o.id === item.opId);
        const name = op ? op.name : 'Unknown';
        opCounts[name] = (opCounts[name] || 0) + 1;
    });
  });
  const barData = Object.keys(opCounts).map(name => ({ name, count: opCounts[name] }));

  // 2. Category Distribution (Pie Chart)
  const catCounts: Record<string, number> = {};
  recipes.forEach(r => {
    r.items.forEach(item => {
        const op = OPERATIONS.find(o => o.id === item.opId);
        const cat = op ? op.category : 'Other';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
  });
  const pieData = Object.keys(catCounts).map(name => ({ name, value: catCounts[name] }));

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-pink-900/20 p-2 rounded-lg">
            <PieIcon className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Recipe Analytics</h2>
            <p className="text-xs text-gray-500 font-mono">SAVED_PIPELINES // USAGE_METRICS</p>
          </div>
        </div>
        <div className="text-xs font-mono text-gray-500">
            Total Recipes: <span className="text-white font-bold">{recipes.length}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        
        {/* Left Column: Charts */}
        <div className="flex flex-col gap-6 overflow-hidden">
            
            {/* Bar Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex-1 flex flex-col min-h-[250px]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarIcon className="w-4 h-4" /> Operation Frequency
                </h3>
                <div className="flex-1 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" horizontal={false} />
                            <XAxis type="number" stroke="#718096" fontSize={10} hide />
                            <YAxis dataKey="name" type="category" stroke="#a0aec0" fontSize={11} width={100} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '4px' }}
                                itemStyle={{ color: '#63b3ed' }}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex-1 flex flex-col min-h-[250px]">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <PieIcon className="w-4 h-4" /> Category Distribution
                </h3>
                <div className="flex-1 w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '4px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

        {/* Right Column: Recipe List */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <List className="w-4 h-4" /> Saved Recipes
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {recipes.length === 0 && (
                    <div className="text-center text-gray-500 mt-10 flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 opacity-20 mb-2" />
                        <p className="text-xs">No saved recipes found.</p>
                    </div>
                )}
                {recipes.map((r) => (
                    <div key={r.id} className="p-3 rounded bg-black/40 border border-gray-800 hover:border-blue-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-bold text-sm text-gray-200 group-hover:text-blue-400 transition-colors">{r.name}</div>
                                <div className="text-[10px] text-gray-500 font-mono">
                                    {new Date(r.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(r.id)}
                                className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                title="Delete Recipe"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                            {r.items.map((item, i) => {
                                const op = OPERATIONS.find(o => o.id === item.opId);
                                return (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                        {op?.name || item.opId}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default CyberChefRecipes;