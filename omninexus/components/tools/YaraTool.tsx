import React, { useState } from 'react';
import { YaraScanResult } from '../../types';
import { Scan, FileText, AlertTriangle, CheckCircle, Code, Play } from 'lucide-react';
import { DEFAULT_YARA_RULE, DEFAULT_YARA_TARGET } from '../../services/mockDataStore';

const YaraTool: React.FC = () => {
  const [ruleText, setRuleText] = useState(DEFAULT_YARA_RULE);
  const [targetText, setTargetText] = useState(DEFAULT_YARA_TARGET);
  const [results, setResults] = useState<YaraScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Simplified YARA Logic Simulator
  const runScan = () => {
    setIsScanning(true);
    setResults([]);

    // Simulate processing delay
    setTimeout(() => {
      try {
        // 1. Extract Rule Name
        const nameMatch = ruleText.match(/rule\s+([a-zA-Z0-9_]+)/);
        const ruleName = nameMatch ? nameMatch[1] : 'Unknown_Rule';

        // 2. Extract Strings (Simplified: looks for $var = "string")
        const stringRegex = /\$[a-z0-9_]+\s*=\s*"([^"]+)"/g;
        let match;
        const searchTerms: string[] = [];
        
        while ((match = stringRegex.exec(ruleText)) !== null) {
          searchTerms.push(match[1]);
        }

        // 3. Scan Target
        const foundMatches: string[] = [];
        searchTerms.forEach(term => {
          if (targetText.toLowerCase().includes(term.toLowerCase())) {
            foundMatches.push(term);
          }
        });

        // 4. Generate Result
        const scanResult: YaraScanResult = {
          ruleName: ruleName,
          matches: foundMatches,
          status: foundMatches.length > 0 ? 'MATCH' : 'NO_MATCH',
          timestamp: Date.now()
        };

        setResults([scanResult]);

      } catch (e) {
        setResults([{
          ruleName: 'Error',
          matches: [],
          status: 'ERROR',
          timestamp: Date.now()
        }]);
      } finally {
        setIsScanning(false);
      }
    }, 800);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-red-900/20 p-2 rounded-lg">
            <Scan className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Yara-X Scanner</h2>
            <p className="text-xs text-gray-500 font-mono">VIRUSTOTAL // PATTERN_MATCHING // V1.2</p>
          </div>
        </div>
        <button 
          onClick={runScan}
          disabled={isScanning}
          className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-all ${
            isScanning 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
          }`}
        >
          {isScanning ? 'SCANNING...' : <><Play className="w-4 h-4" /> RUN SCAN</>}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        
        {/* Left Column: Editor */}
        <div className="flex flex-col gap-4 overflow-hidden">
           {/* Rule Editor */}
           <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
             <div className="p-2 px-3 border-b border-gray-800 bg-black/40 flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
                  <Code className="w-3 h-3" /> Rule Definition
                </span>
             </div>
             <textarea 
               value={ruleText}
               onChange={(e) => setRuleText(e.target.value)}
               className="flex-1 bg-[#0d1117] p-4 text-sm font-mono text-blue-100 focus:outline-none resize-none leading-relaxed"
               spellCheck={false}
             />
           </div>

           {/* Target Input */}
           <div className="h-1/3 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
             <div className="p-2 px-3 border-b border-gray-800 bg-black/40 flex justify-between items-center">
                <span className="text-xs font-bold text-yellow-500 uppercase flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Target Payload
                </span>
             </div>
             <textarea 
               value={targetText}
               onChange={(e) => setTargetText(e.target.value)}
               className="flex-1 bg-black/50 p-4 text-sm font-mono text-gray-300 focus:outline-none resize-none"
               placeholder="Paste content to scan..."
             />
           </div>
        </div>

        {/* Right Column: Results */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-800 bg-black/40">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scan Results</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-black/20">
            {results.length === 0 && !isScanning && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                <Scan className="w-12 h-12 mb-2" />
                <p className="text-sm">Ready to scan</p>
              </div>
            )}

            {results.map((res, idx) => (
              <div key={idx} className={`mb-4 p-4 rounded border ${
                res.status === 'MATCH' ? 'bg-red-900/10 border-red-900/50' : 'bg-green-900/10 border-green-900/50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                      {res.status === 'MATCH' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <span className={`font-bold ${res.status === 'MATCH' ? 'text-red-400' : 'text-green-400'}`}>
                        {res.status === 'MATCH' ? 'THREAT DETECTED' : 'NO THREATS FOUND'}
                      </span>
                   </div>
                   <span className="text-xs text-gray-500 font-mono">
                     {new Date(res.timestamp).toLocaleTimeString()}
                   </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rule:</span>
                    <span className="text-gray-200 font-mono">{res.ruleName}</span>
                  </div>
                  {res.status === 'MATCH' && (
                    <div className="mt-2">
                       <span className="text-xs text-gray-500 uppercase font-bold">Matched Strings:</span>
                       <div className="mt-1 flex flex-wrap gap-2">
                         {res.matches.map((m, i) => (
                           <span key={i} className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded font-mono border border-red-900/50">
                             "{m}"
                           </span>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Console Footer */}
          <div className="p-2 border-t border-gray-800 bg-black font-mono text-[10px] text-gray-500 flex justify-between">
            <span>ENGINE: YARA-X WASM (SIMULATED)</span>
            <span>RULES LOADED: 1</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default YaraTool;
