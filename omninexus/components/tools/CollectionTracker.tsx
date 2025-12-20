
import React, { useState, useEffect } from 'react';
import { CardCollectionItem, TcgGame } from '../../types';
import { MOCK_COLLECTION, MOCK_BUDGETS } from '../../services/mockDataStore';
import { TrendingUp, DollarSign, Package, Filter, Plus, Search, Trophy, Edit3, Trash, AlertTriangle, CheckCircle } from 'lucide-react';

interface CollectionTrackerProps {
  selectedGame: TcgGame;
}

const CollectionTracker: React.FC<CollectionTrackerProps> = ({ selectedGame }) => {
  const [collection, setCollection] = useState<CardCollectionItem[]>(MOCK_COLLECTION);
  const [filteredCollection, setFilteredCollection] = useState<CardCollectionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- CROSS DOMAIN LOGIC ---
  // Check Productivity Domain for Gaming Budget
  const gamingBudget = MOCK_BUDGETS.find(b => b.category === 'GAMING');
  const remainingBudget = gamingBudget ? gamingBudget.limit - gamingBudget.spent : 0;

  useEffect(() => {
    const filtered = collection.filter(card => 
      card.game === selectedGame &&
      (card.name.toLowerCase().includes(searchTerm.toLowerCase()) || card.setName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCollection(filtered);
  }, [selectedGame, collection, searchTerm]);

  // Statistics
  const totalValue = filteredCollection.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const totalCards = filteredCollection.reduce((acc, curr) => acc + curr.quantity, 0);
  const topCard = [...filteredCollection].sort((a, b) => b.price - a.price)[0];
  
  const totalCost = filteredCollection.reduce((acc, curr) => acc + ((curr.purchasePrice || curr.price * 0.8) * curr.quantity), 0);
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="flex flex-col space-y-4 animate-fade-in text-gray-200 h-full">
      
      {/* Budget Awareness Banner */}
      <div className={`flex justify-between items-center p-3 rounded-lg border ${remainingBudget < 50 ? 'bg-red-900/10 border-red-900/50' : 'bg-green-900/10 border-green-900/50'}`}>
         <div className="flex items-center gap-2">
            <DollarSign className={`w-4 h-4 ${remainingBudget < 50 ? 'text-red-400' : 'text-green-400'}`} />
            <span className="text-xs font-bold text-gray-300">
               Monthly Gaming Budget: 
               <span className={remainingBudget < 50 ? 'text-red-400 ml-1' : 'text-green-400 ml-1'}>
                 ${remainingBudget.toFixed(2)} remaining
               </span>
            </span>
         </div>
         {remainingBudget < 50 && (
             <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> STOP SPENDING
             </span>
         )}
      </div>

      {/* Portfolio Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-green-500" />
           </div>
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Portfolio Value</h3>
           <div className="text-2xl font-bold text-gray-100">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
           <div className={`text-xs font-mono mt-2 flex items-center gap-1 ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <TrendingUp className="w-3 h-3" />
              {totalGain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}% (${Math.abs(totalGain).toFixed(2)})
           </div>
        </div>

        {/* Card Count */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="w-16 h-16 text-blue-500" />
           </div>
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Cards</h3>
           <div className="text-2xl font-bold text-gray-100">{totalCards}</div>
           <div className="text-xs text-gray-500 font-mono mt-2">
              Across {new Set(filteredCollection.map(c => c.setName)).size} Sets
           </div>
        </div>

        {/* Top Mover / MVP */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-16 h-16 text-yellow-500" />
           </div>
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Crown Jewel</h3>
           {topCard ? (
             <>
               <div className="text-lg font-bold text-yellow-100 truncate">{topCard.name}</div>
               <div className="text-xs text-yellow-500 font-mono flex items-center gap-2 mt-1">
                 <span>${topCard.price.toLocaleString()}</span>
                 <span className="px-1.5 py-0.5 rounded bg-yellow-900/30 border border-yellow-700">{topCard.condition}</span>
                 {topCard.isFoil && <span className="text-[10px] animate-pulse">✨ Foil</span>}
               </div>
             </>
           ) : (
             <div className="text-sm text-gray-500 italic mt-2">No cards in collection</div>
           )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-800">
         <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded pl-9 pr-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
            />
         </div>
         <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium border border-gray-700 transition-all flex items-center gap-2">
              <Filter className="w-3 h-3" /> Filter
            </button>
            <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-all flex items-center gap-2">
              <Plus className="w-3 h-3" /> Add Card
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-gray-500 font-medium sticky top-0 z-10">
              <tr>
                <th className="p-3 w-10"></th>
                <th className="p-3">Card Name</th>
                <th className="p-3">Set</th>
                <th className="p-3 w-20">Cond.</th>
                <th className="p-3 w-20 text-center">Qty</th>
                <th className="p-3 w-24 text-right">Price</th>
                <th className="p-3 w-24 text-right">Total</th>
                <th className="p-3 w-24 text-center">Status</th>
                <th className="p-3 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCollection.length === 0 ? (
                <tr>
                   <td colSpan={9} className="p-8 text-center text-gray-500">
                      Collection is empty for {selectedGame}.
                   </td>
                </tr>
              ) : filteredCollection.map((card) => {
                const isOverBudget = card.price > remainingBudget;
                return (
                  <tr key={card.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-3 text-center text-yellow-500">
                       {card.isFoil && <span title="Foil">✨</span>}
                    </td>
                    <td className="p-3 font-medium text-gray-200">
                       {card.name}
                       <div className="text-[10px] text-gray-500 font-mono">#{card.cardNumber}</div>
                    </td>
                    <td className="p-3 text-gray-400">{card.setName}</td>
                    <td className="p-3">
                       <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                          card.condition === 'NM' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 
                          card.condition === 'LP' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50' :
                          'bg-red-900/20 text-red-400 border-red-900/50'
                       }`}>
                          {card.condition}
                       </span>
                    </td>
                    <td className="p-3 text-center text-gray-300 font-mono">{card.quantity}</td>
                    <td className="p-3 text-right text-gray-300 font-mono">${card.price.toFixed(2)}</td>
                    <td className="p-3 text-right text-green-400 font-mono font-bold">${(card.price * card.quantity).toFixed(2)}</td>
                    
                    {/* Budget Warning Check */}
                    <td className="p-3 text-center">
                       {isOverBudget ? (
                         <div className="flex items-center justify-center gap-1 text-[10px] text-red-400 bg-red-900/20 border border-red-900/50 px-2 py-0.5 rounded" title={`Price ($${card.price}) exceeds remaining budget ($${remainingBudget})`}>
                            <AlertTriangle className="w-3 h-3" /> Unaffordable
                         </div>
                       ) : (
                         <div className="text-[10px] text-green-500 flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Budget OK
                         </div>
                       )}
                    </td>

                    <td className="p-3 flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                       <button className="p-1 hover:text-blue-400"><Edit3 className="w-3 h-3" /></button>
                       <button className="p-1 hover:text-red-400"><Trash className="w-3 h-3" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-2 border-t border-gray-800 bg-black/40 text-[10px] text-gray-500 flex justify-between">
           <span>Prices updated: Just now</span>
           <span>Source: TCGPlayer Market</span>
        </div>
      </div>

    </div>
  );
};

export default CollectionTracker;
