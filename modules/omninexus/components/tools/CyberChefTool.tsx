
import React, { useState, useEffect } from 'react';
import { ChefOperation, ChefRecipeItem, SavedRecipe } from '../../types';
import { ChefHat, Trash2, ArrowRight, ArrowDown, Play, Save, Plus, X } from 'lucide-react';

// --- Core Operations Implementation ---
export const OPERATIONS: ChefOperation[] = [
  { 
    id: 'to_base64', 
    name: 'To Base64', 
    category: 'Encoding',
    func: (input) => btoa(input)
  },
  { 
    id: 'from_base64', 
    name: 'From Base64', 
    category: 'Encoding',
    func: (input) => {
      try { return atob(input); } catch { return '[Error: Invalid Base64]'; }
    }
  },
  { 
    id: 'to_hex', 
    name: 'To Hex', 
    category: 'Encoding',
    func: (input) => input.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
  },
  { 
    id: 'from_hex', 
    name: 'From Hex', 
    category: 'Encoding',
    func: (input) => {
      try {
        const hex = input.replace(/\s+/g, '');
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
      } catch { return '[Error: Invalid Hex]'; }
    }
  },
  { 
    id: 'url_encode', 
    name: 'URL Encode', 
    category: 'Utils',
    func: (input) => encodeURIComponent(input)
  },
  { 
    id: 'url_decode', 
    name: 'URL Decode', 
    category: 'Utils',
    func: (input) => decodeURIComponent(input)
  },
  { 
    id: 'reverse', 
    name: 'Reverse', 
    category: 'Utils',
    func: (input) => input.split('').reverse().join('')
  },
  {
    id: 'rot13',
    name: 'ROT13',
    category: 'Encryption',
    func: (input) => input.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(base + (c.charCodeAt(0) - base + 13) % 26);
    })
  }
];

const CyberChefTool: React.FC = () => {
  const [input, setInput] = useState('Hello World');
  const [output, setOutput] = useState('');
  const [recipe, setRecipe] = useState<ChefRecipeItem[]>([
    { id: '1', opId: 'to_base64' }
  ]);
  const [draggedOp, setDraggedOp] = useState<string | null>(null);

  // Auto Bake (Effect)
  useEffect(() => {
    let result = input;
    for (const step of recipe) {
      const op = OPERATIONS.find(o => o.id === step.opId);
      if (op) {
        result = op.func(result);
      }
    }
    setOutput(result);
  }, [input, recipe]);

  const addToRecipe = (opId: string) => {
    setRecipe([...recipe, { id: Date.now().toString(), opId }]);
  };

  const removeFromRecipe = (id: string) => {
    setRecipe(recipe.filter(item => item.id !== id));
  };

  const clearRecipe = () => setRecipe([]);

  const saveRecipe = () => {
    if (recipe.length === 0) {
        alert("Cannot save an empty recipe.");
        return;
    }
    const name = window.prompt("Enter a name for this recipe:", "My New Recipe");
    if (!name) return;

    const newRecipe: SavedRecipe = {
        id: Date.now().toString(),
        name,
        items: recipe,
        timestamp: Date.now()
    };

    try {
        const existingStr = localStorage.getItem('cyberchef_recipes') || '[]';
        const existing = JSON.parse(existingStr);
        const updated = [...existing, newRecipe];
        localStorage.setItem('cyberchef_recipes', JSON.stringify(updated));
        alert("Recipe saved successfully!");
    } catch (e) {
        console.error("Failed to save recipe", e);
        alert("Error saving recipe.");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Tool Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <ChefHat className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">CyberChef Node</h2>
            <p className="text-xs text-gray-500 font-mono">GCHQ // ENCODING_PIPELINE // V1.0</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={clearRecipe}
            className="px-3 py-1.5 text-xs font-mono border border-red-900/50 bg-red-900/10 text-red-400 hover:bg-red-900/30 rounded flex items-center gap-2 transition-all">
             <Trash2 className="w-3 h-3" /> CLEAR RECIPE
           </button>
           <button 
             onClick={saveRecipe}
             className="px-3 py-1.5 text-xs font-mono bg-green-600 hover:bg-green-500 text-white rounded flex items-center gap-2 transition-all">
             <Save className="w-3 h-3" /> SAVE RECIPE
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        
        {/* Operations Library (Left) */}
        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-800 bg-gray-900">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {Array.from(new Set(OPERATIONS.map(o => o.category))).map(cat => (
              <div key={cat}>
                <div className="text-[10px] text-gray-600 font-bold mb-2 uppercase px-1">{cat}</div>
                <div className="space-y-1">
                  {OPERATIONS.filter(op => op.category === cat).map(op => (
                    <button
                      key={op.id}
                      onClick={() => addToRecipe(op.id)}
                      className="w-full text-left px-3 py-2 rounded bg-black/20 hover:bg-cyber-accent/10 border border-transparent hover:border-cyber-accent/30 text-xs text-gray-300 transition-all flex items-center justify-between group"
                    >
                      {op.name}
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-cyber-accent" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recipe Builder (Center) */}
        <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-lg flex flex-col">
          <div className="p-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipe</h3>
            {recipe.length > 0 && <span className="text-[10px] bg-blue-900 text-blue-200 px-2 rounded-full">{recipe.length} steps</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
             {recipe.length === 0 && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 opacity-50 pointer-events-none">
                 <ArrowRight className="w-8 h-8 mb-2" />
                 <p className="text-xs">Add operations here</p>
               </div>
             )}
             {recipe.map((step, index) => {
               const op = OPERATIONS.find(o => o.id === step.opId);
               return (
                 <div key={step.id} className="relative group">
                   <div className="bg-gray-800 border border-gray-700 p-3 rounded shadow-lg flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-200">{op?.name}</span>
                     <button 
                       onClick={() => removeFromRecipe(step.id)}
                       className="text-gray-500 hover:text-red-400 transition-colors"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                   {index < recipe.length - 1 && (
                     <div className="flex justify-center py-1">
                       <ArrowDown className="w-4 h-4 text-gray-600" />
                     </div>
                   )}
                 </div>
               );
             })}
          </div>
        </div>

        {/* Input / Output (Right) */}
        <div className="col-span-7 grid grid-rows-2 gap-4">
          
          {/* Input */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
             <div className="p-2 px-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Input</span>
                <span className="text-[10px] text-gray-600 font-mono">{input.length} chars</span>
             </div>
             <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               className="flex-1 bg-black/50 p-4 text-sm font-mono text-gray-300 focus:outline-none resize-none"
               placeholder="Enter data to process..."
             />
          </div>

          {/* Output */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
             <div className="p-2 px-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                <span className="text-xs font-bold text-cyber-success uppercase flex items-center gap-2">
                  <Play className="w-3 h-3 fill-cyber-success" /> Output
                </span>
                <span className="text-[10px] text-gray-600 font-mono">{output.length} chars</span>
             </div>
             <textarea 
               readOnly
               value={output}
               className="flex-1 bg-black/80 p-4 text-sm font-mono text-cyber-success focus:outline-none resize-none"
               placeholder="Recipe output..."
             />
          </div>

        </div>

      </div>
    </div>
  );
};

export default CyberChefTool;