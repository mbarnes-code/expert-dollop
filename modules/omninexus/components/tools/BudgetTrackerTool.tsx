
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Upload, DollarSign, CreditCard, Link, AlertTriangle, CheckCircle, FileText, Plus, RefreshCw, Wallet } from 'lucide-react';
import { MOCK_BUDGETS, MOCK_TRANSACTIONS } from '../../services/mockDataStore';
import { Budget, Transaction } from '../../types';

const BudgetTrackerTool: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  // Calculate totals
  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  // Mock Ingestion Logic
  const handleIngest = (source: 'PDF' | 'BANK') => {
    setIngestionStatus('PROCESSING');
    setIsIngesting(true);
    
    setTimeout(() => {
      setIngestionStatus('SUCCESS');
      setIsIngesting(false);
      // Mock adding a new transaction from ingestion
      const newTx: Transaction = {
        id: `t-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        merchant: source === 'PDF' ? 'Imported Statement #404' : 'Chase Bank Sync',
        amount: 250.00,
        category: 'TECH',
        source: source === 'PDF' ? 'PDF_IMPORT' : 'BANK_SYNC'
      };
      setTransactions(prev => [newTx, ...prev]);
      
      // Update budget
      const updatedBudgets = budgets.map(b => 
        b.category === 'TECH' ? { ...b, spent: b.spent + 250 } : b
      );
      setBudgets(updatedBudgets);

      setTimeout(() => setIngestionStatus('IDLE'), 3000);
    }, 2000);
  };

  const getBarColor = (spent: number, limit: number) => {
    const ratio = spent / limit;
    if (ratio >= 1) return '#ef4444'; // Red
    if (ratio >= 0.8) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-green-900/20 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Actual Budget</h2>
            <p className="text-xs text-gray-500 font-mono">FINANCE_CORE // ACTUAL_SERVER // V2.1</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => handleIngest('PDF')}
             className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-bold flex items-center gap-2 border border-gray-700 transition-all"
           >
             {isIngesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
             Ingest PDF
           </button>
           <button 
             onClick={() => handleIngest('BANK')}
             className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
           >
             <Link className="w-4 h-4" /> Link Bank
           </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Left Col: Budget Overview */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
               <div className="text-xs text-gray-500 font-bold uppercase">Monthly Limit</div>
               <div className="text-xl font-bold text-gray-200">${totalBudget.toLocaleString()}</div>
             </div>
             <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
               <div className="text-xs text-gray-500 font-bold uppercase">Total Spent</div>
               <div className="text-xl font-bold text-blue-400">${totalSpent.toLocaleString()}</div>
             </div>
             <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg">
               <div className="text-xs text-gray-500 font-bold uppercase">Remaining</div>
               <div className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-400'}`}>
                 ${remaining.toLocaleString()}
               </div>
             </div>
          </div>

          {/* Budget Categories */}
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-6 overflow-y-auto">
             <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Category Breakdown
             </h3>
             <div className="space-y-6">
                {budgets.map((b) => (
                  <div key={b.category}>
                     <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-sm text-gray-300">{b.category}</span>
                        <div className="text-xs font-mono">
                           <span className={b.spent > b.limit ? 'text-red-400' : 'text-gray-400'}>${b.spent}</span>
                           <span className="text-gray-600"> / ${b.limit}</span>
                        </div>
                     </div>
                     <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min((b.spent / b.limit) * 100, 100)}%`,
                            backgroundColor: getBarColor(b.spent, b.limit)
                          }}
                        />
                     </div>
                     {b.spent >= b.limit && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400">
                           <AlertTriangle className="w-3 h-3" /> Over budget by ${(b.spent - b.limit).toFixed(2)}
                        </div>
                     )}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Col: Transactions & Ingestion Log */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
           
           {/* Ingestion Status Banner */}
           {ingestionStatus === 'SUCCESS' && (
             <div className="bg-green-900/20 border-b border-green-900/50 p-2 flex items-center justify-center gap-2 text-green-400 text-xs font-bold animate-pulse">
                <CheckCircle className="w-4 h-4" /> Imported 15 transactions successfully
             </div>
           )}

           <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Recent Transactions
              </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-left text-xs">
                 <tbody className="divide-y divide-gray-800">
                    {transactions.map((tx) => (
                       <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                             <div className="font-bold text-gray-300">{tx.merchant}</div>
                             <div className="text-[10px] text-gray-500 font-mono">{tx.date}</div>
                          </td>
                          <td className="p-3 text-right">
                             <div className="font-mono font-bold text-gray-200">-${tx.amount.toFixed(2)}</div>
                             <div className="text-[10px] text-gray-500 uppercase">{tx.category}</div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <button className="p-3 border-t border-gray-800 text-xs text-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
              View All Transactions
           </button>
        </div>

      </div>
    </div>
  );
};

export default BudgetTrackerTool;
