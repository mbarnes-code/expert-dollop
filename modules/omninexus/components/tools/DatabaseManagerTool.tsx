
import React, { useState } from 'react';
import { Database, Server, RefreshCw, Power, Terminal, Activity, Table, Code, FileCode, Lock, Unlock, HardDrive, Layers, Zap, Search, Eye, Settings, Key } from 'lucide-react';
import { DatabaseSchema, DjangoService, SqliteDatabase, RedisDatabase, ElasticIndex } from '../../types';
import { MOCK_DB_SCHEMAS, MOCK_DJANGO_SERVICES, MOCK_SQLITE_DBS, MOCK_REDIS_DBS, MOCK_ELASTIC_INDICES } from '../../services/mockDataStore';

const DatabaseManagerTool: React.FC = () => {
  const [schemas] = useState<DatabaseSchema[]>(MOCK_DB_SCHEMAS);
  const [djangoApps] = useState<DjangoService[]>(MOCK_DJANGO_SERVICES);
  const [sqliteDbs] = useState<SqliteDatabase[]>(MOCK_SQLITE_DBS);
  const [redisDbs] = useState<RedisDatabase[]>(MOCK_REDIS_DBS);
  const [elasticIndices] = useState<ElasticIndex[]>(MOCK_ELASTIC_INDICES);
  const [activeTab, setActiveTab] = useState<'POSTGRES' | 'DJANGO' | 'SQLITE' | 'REDIS' | 'ELASTIC'>('POSTGRES');
  
  // New state for config overlay
  const [selectedConfig, setSelectedConfig] = useState<{title: string, data: Record<string,string>} | null>(null);

  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '> Initializing Nexus Data Center...',
    '> Connecting to Local PostgreSQL (Port 5432)... OK',
    '> Connecting to Django Gunicorn Workers... OK',
    '> Scanning for SQLite artifacts... Found 4.',
    '> Connecting to Redis Cluster (127.0.0.1:6379)... OK',
    '> Connecting to Elasticsearch (Port 9200)... OK',
    '> All systems nominal.'
  ]);

  const runMockCommand = (cmd: string) => {
    setTerminalOutput(prev => [...prev, `> ${cmd}`, '... Executing', 'Done.']);
  };

  const showDjangoConfig = (app: DjangoService) => {
      setSelectedConfig({
          title: `Config: ${app.appName}`,
          data: {
              'DJANGO_SETTINGS_MODULE': `${app.appName}.settings`,
              'DATABASE_URL': `postgres://nexus_user:****@localhost:5432/${app.appName}`,
              'DEBUG': 'False',
              'ALLOWED_HOSTS': 'localhost,127.0.0.1',
              'PYTHON_VERSION': app.pythonVersion,
              'WORKERS': app.workers.toString()
          }
      });
  };

  const showDbConfig = (schema: DatabaseSchema) => {
      setSelectedConfig({
          title: `Schema: ${schema.name}`,
          data: {
              'Host': 'localhost',
              'Port': '5432',
              'User': schema.owner,
              'Encoding': 'UTF8',
              'Connection Limit': '100',
              'Tablespace': 'pg_default'
          }
      });
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in text-gray-200 relative">
      
      {/* Configuration Overlay */}
      {selectedConfig && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-10 animate-fade-in">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-lg shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-blue-400" />
                          {selectedConfig.title}
                      </h3>
                      <button onClick={() => setSelectedConfig(null)} className="text-gray-500 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-2 mb-6">
                      {Object.entries(selectedConfig.data).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center p-2 bg-black/40 rounded border border-gray-800">
                              <span className="text-xs font-mono text-gray-400">{key}</span>
                              <span className="text-xs font-mono text-green-400">{val}</span>
                          </div>
                      ))}
                  </div>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => { runMockCommand(`redeploy ${selectedConfig.title}`); setSelectedConfig(null); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold text-white">Save & Restart</button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900/20 p-2 rounded-lg">
            <Server className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Local Data Center</h2>
            <p className="text-xs text-gray-500 font-mono">POSTGRESQL // DJANGO // REDIS // ELASTIC</p>
          </div>
        </div>
        
        <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
           <button 
             onClick={() => setActiveTab('POSTGRES')}
             className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'POSTGRES' ? 'bg-blue-900/40 text-blue-200 border border-blue-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Database className="w-3 h-3" /> POSTGRES
           </button>
           <button 
             onClick={() => setActiveTab('DJANGO')}
             className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'DJANGO' ? 'bg-green-900/40 text-green-200 border border-green-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Code className="w-3 h-3" /> DJANGO
           </button>
           <button 
             onClick={() => setActiveTab('SQLITE')}
             className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'SQLITE' ? 'bg-purple-900/40 text-purple-200 border border-purple-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <FileCode className="w-3 h-3" /> SQLITE
           </button>
           <button 
             onClick={() => setActiveTab('REDIS')}
             className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'REDIS' ? 'bg-red-900/40 text-red-200 border border-red-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Layers className="w-3 h-3" /> REDIS
           </button>
           <button 
             onClick={() => setActiveTab('ELASTIC')}
             className={`px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ELASTIC' ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-800' : 'text-gray-500 hover:text-gray-300'}`}
           >
             <Search className="w-3 h-3" /> ELASTIC
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Main Panel (Stats & Lists) */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden">
          
          {/* Postgres View */}
          {activeTab === 'POSTGRES' && (
            <div className="flex-1 flex flex-col animate-fade-in">
               <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                     <Database className="w-4 h-4" /> Active Schemas
                  </h3>
                  <div className="text-[10px] text-gray-500 font-mono">Ver: 16.1-alpine</div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {schemas.map((schema, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between hover:border-blue-500/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded bg-gray-800 ${schema.status === 'ONLINE' ? 'group-hover:bg-blue-900/20' : ''}`}>
                             <Table className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
                          </div>
                          <div>
                             <div className="font-bold text-gray-200 text-sm">{schema.name}</div>
                             <div className="text-[10px] text-gray-500 font-mono">Owner: {schema.owner}</div>
                          </div>
                       </div>
                       
                       <div className="flex gap-6 text-center">
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{schema.tables}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Tables</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{schema.size}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Size</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{schema.connections}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Conns</div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                           <button onClick={() => showDbConfig(schema)} className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white" title="Connection Settings"><Settings className="w-3 h-3" /></button>
                           <div className={`px-2 py-1 rounded text-[10px] font-bold border ${schema.status === 'ONLINE' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'}`}>
                              {schema.status}
                           </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Django View */}
          {activeTab === 'DJANGO' && (
            <div className="flex-1 flex flex-col animate-fade-in">
               <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                     <Code className="w-4 h-4" /> Python/Django Services
                  </h3>
                  <div className="text-[10px] text-gray-500 font-mono">Env: venv-nexus</div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {djangoApps.map((app, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between hover:border-green-500/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded bg-gray-800 ${app.status === 'RUNNING' ? 'group-hover:bg-green-900/20' : ''}`}>
                             <Activity className="w-6 h-6 text-gray-400 group-hover:text-green-400" />
                          </div>
                          <div>
                             <div className="font-bold text-gray-200 text-sm">{app.appName}</div>
                             <div className="text-[10px] text-gray-500 font-mono">Port: {app.port}</div>
                          </div>
                       </div>
                       
                       <div className="flex gap-6 text-center">
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{app.workers}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Workers</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{app.version}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Django</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{app.pythonVersion}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Python</div>
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <button onClick={() => showDjangoConfig(app)} className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="View Config">
                             <Key className="w-3 h-3" />
                          </button>
                          <button onClick={() => runMockCommand(`systemctl restart ${app.appName}`)} className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Restart">
                             <RefreshCw className="w-3 h-3" />
                          </button>
                          <div className={`px-2 py-1 rounded text-[10px] font-bold border ${app.status === 'RUNNING' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'}`}>
                              {app.status}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* SQLite View */}
          {activeTab === 'SQLITE' && (
            <div className="flex-1 flex flex-col animate-fade-in">
               <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                     <FileCode className="w-4 h-4" /> SQLite Databases
                  </h3>
                  <div className="text-[10px] text-gray-500 font-mono">Filesystem: /mnt/data</div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {sqliteDbs.map((db, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between hover:border-purple-500/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded bg-gray-800 ${db.status === 'LOCKED' ? 'group-hover:bg-red-900/20' : 'group-hover:bg-purple-900/20'}`}>
                             <HardDrive className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
                          </div>
                          <div>
                             <div className="font-bold text-gray-200 text-sm">{db.name}</div>
                             <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                {db.tool}
                                <span className="text-gray-700">|</span>
                                <span className="text-gray-600 truncate max-w-[150px]">{db.path}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-6 text-center">
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{db.size}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Size</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{db.lastModified}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Modified</div>
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Vacuum DB">
                             <RefreshCw className="w-3 h-3" />
                          </button>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border ${db.status === 'READY' ? 'bg-purple-900/20 text-purple-300 border-purple-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'}`}>
                              {db.status === 'LOCKED' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              {db.status}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Redis View */}
          {activeTab === 'REDIS' && (
            <div className="flex-1 flex flex-col animate-fade-in">
               <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                     <Layers className="w-4 h-4" /> Redis Keyspaces
                  </h3>
                  <div className="text-[10px] text-gray-500 font-mono">Ver: 7.2.3</div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {redisDbs.map((db, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between hover:border-red-500/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded flex items-center justify-center font-bold text-lg bg-gray-800 text-gray-500 group-hover:bg-red-900/20 group-hover:text-red-400 border border-gray-700 group-hover:border-red-900/50`}>
                             {db.index}
                          </div>
                          <div>
                             <div className="font-bold text-gray-200 text-sm">{db.name}</div>
                             <div className="text-[10px] text-gray-500 font-mono">{db.description}</div>
                          </div>
                       </div>
                       
                       <div className="flex gap-6 text-center">
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{db.keys.toLocaleString()}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Keys</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{db.memory}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Memory</div>
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-[10px] font-bold border ${db.status === 'READY' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50'}`}>
                              {db.status}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Elastic View */}
          {activeTab === 'ELASTIC' && (
            <div className="flex-1 flex flex-col animate-fade-in">
               <div className="p-3 border-b border-gray-800 bg-black/20 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                     <Search className="w-4 h-4" /> Elasticsearch Indices
                  </h3>
                  <div className="text-[10px] text-gray-500 font-mono">Ver: 8.11.0</div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {elasticIndices.map((idx, i) => (
                    <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded-lg flex items-center justify-between hover:border-yellow-500/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded bg-gray-800 group-hover:bg-yellow-900/20`}>
                             <Search className="w-6 h-6 text-gray-400 group-hover:text-yellow-400" />
                          </div>
                          <div>
                             <div className="font-bold text-gray-200 text-sm">{idx.name}</div>
                             <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                App: <span className="text-blue-400">{idx.app}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex gap-6 text-center">
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{idx.docs.toLocaleString()}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Docs</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-400 font-bold">{idx.size}</div>
                             <div className="text-[10px] text-gray-600 uppercase">Size</div>
                          </div>
                       </div>

                       <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Inspect Index">
                             <Eye className="w-3 h-3" />
                          </button>
                          <div className={`w-3 h-3 rounded-full border ${
                              idx.health === 'green' ? 'bg-green-500 border-green-300' : 
                              idx.health === 'yellow' ? 'bg-yellow-500 border-yellow-300 animate-pulse' : 
                              'bg-red-500 border-red-300 animate-pulse'
                          }`} title={`Health: ${idx.health}`}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>

        {/* Side Panel: Actions & Terminal */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Power className="w-4 h-4" /> Control Plane
             </h3>
             <div className="grid grid-cols-2 gap-2">
                {activeTab === 'POSTGRES' && (
                    <>
                        <button 
                        onClick={() => runMockCommand('docker-compose up -d postgres')}
                        className="p-2 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-900/50 rounded text-xs text-blue-300 transition-all text-left">
                        Start DB
                        </button>
                        <button 
                        onClick={() => runMockCommand('docker-compose stop postgres')}
                        className="p-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded text-xs text-red-300 transition-all text-left">
                        Stop DB
                        </button>
                    </>
                )}
                {activeTab === 'DJANGO' && (
                    <>
                         <button 
                            onClick={() => runMockCommand('python manage.py migrate')}
                            className="p-2 bg-green-900/20 hover:bg-green-900/40 border border-green-900/50 rounded text-xs text-green-300 transition-all text-left">
                            Migrate All
                        </button>
                        <button 
                            onClick={() => runMockCommand('python manage.py collectstatic')}
                            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 transition-all text-left">
                            Collect Static
                        </button>
                    </>
                )}
                {activeTab === 'SQLITE' && (
                    <>
                        <button 
                        onClick={() => runMockCommand('sqlite3 vacuum all')}
                        className="p-2 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-900/50 rounded text-xs text-purple-300 transition-all text-left">
                        Vacuum All
                        </button>
                        <button 
                        onClick={() => runMockCommand('cp *.db /backup/')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 transition-all text-left">
                        Backup Files
                        </button>
                    </>
                )}
                {activeTab === 'REDIS' && (
                    <>
                        <button 
                        onClick={() => runMockCommand('redis-cli FLUSHDB')}
                        className="p-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded text-xs text-red-300 transition-all text-left flex items-center gap-1">
                        <Zap className="w-3 h-3" /> FLUSH ALL
                        </button>
                        <button 
                        onClick={() => runMockCommand('redis-cli INFO')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 transition-all text-left">
                        Info Stats
                        </button>
                    </>
                )}
                {activeTab === 'ELASTIC' && (
                    <>
                        <button 
                        onClick={() => runMockCommand('curl -X GET "localhost:9200/_cat/indices?v"')}
                        className="p-2 bg-yellow-900/20 hover:bg-yellow-900/40 border border-yellow-900/50 rounded text-xs text-yellow-300 transition-all text-left">
                        List Indices
                        </button>
                        <button 
                        onClick={() => runMockCommand('curl -X GET "localhost:9200/_cluster/health"')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 transition-all text-left">
                        Cluster Health
                        </button>
                    </>
                )}
             </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 bg-black border border-gray-800 rounded-lg flex flex-col overflow-hidden">
             <div className="p-2 px-3 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
                <Terminal className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">System Log</span>
             </div>
             <div className="flex-1 p-3 font-mono text-[10px] text-gray-300 overflow-y-auto space-y-1">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="opacity-80">{line}</div>
                ))}
                <div className="animate-pulse">_</div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DatabaseManagerTool;
