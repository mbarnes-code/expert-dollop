
import { HelkLogEntry, MispEvent, DatabaseSchema, DjangoService, SqliteDatabase, RedisDatabase, ElasticIndex, CardCollectionItem, Budget, Transaction, CalendarEvent, MealPlan, NewsItem, NexusWorkflow, CrawlerTask } from '../types';

// --- CENTRALIZED DATA STORE FOR CROSS-TOOL CORRELATION ---

// 1. MISP: Threat Intelligence
export const MOCK_MISP_EVENTS: MispEvent[] = [
  { 
    id: '1044', 
    uuid: '5f9b3b1a-8c44-4b5a-9b1a-1234567890ab',
    date: '2023-10-27', 
    org: 'CIRCL', 
    info: 'OSINT - Emotet resurgence campaign via malicious Word docs', 
    threat_level_id: '1', 
    analysis: '2', 
    distribution: 'All communities', 
    attribute_count: 142, 
    tags: ['tlp:white', 'malware:emotet', 'finance', 'ioc:10.0.0.5'] 
  },
  { 
    id: '1043', 
    uuid: '5f9b3b1a-8c44-4b5a-9b1a-0987654321cd',
    date: '2023-10-26', 
    org: 'NCSC-NL', 
    info: 'APT28 credential harvesting infrastructure', 
    threat_level_id: '2', 
    analysis: '1', 
    distribution: 'Connected communities', 
    attribute_count: 56, 
    tags: ['tlp:amber', 'apt:APT28', 'phishing'] 
  },
  { 
    id: '1042', 
    uuid: '5f9b3b1a-8c44-4b5a-9b1a-112233445566',
    date: '2023-10-25', 
    org: 'OmniNexus_SOC', 
    info: 'Internal: Suspicious RDP brute force activity detected', 
    threat_level_id: '3', 
    analysis: '0', 
    distribution: 'This Organization', 
    attribute_count: 12, 
    tags: ['tlp:red', 'internal', 'brute-force'] 
  },
];

// 2. HELK: System Logs
export const MOCK_HELK_LOGS: HelkLogEntry[] = [
  { id: 'evt-1024', timestamp: '2023-10-27T14:22:01.000Z', source_ip: '192.168.1.105', dest_ip: '10.0.0.5', event_id: 3, process_name: 'powershell.exe', message: 'Network connection detected to suspicious port 4444 (Matches MISP Emotet IOC)', severity: 'WARN' },
  { id: 'evt-1025', timestamp: '2023-10-27T14:22:05.000Z', source_ip: '192.168.1.105', dest_ip: '-', event_id: 1, process_name: 'cmd.exe', message: 'Process creation: cmd.exe /c whoami', severity: 'INFO' },
  { id: 'evt-1026', timestamp: '2023-10-27T14:23:12.000Z', source_ip: '192.168.1.105', dest_ip: '-', event_id: 1, process_name: 'mimikatz.exe', message: 'Process creation: mimikatz.exe privilege::debug', severity: 'ERROR' },
  { id: 'evt-1027', timestamp: '2023-10-27T14:24:00.000Z', source_ip: '192.168.1.105', dest_ip: '104.21.55.2', event_id: 3, process_name: 'svchost.exe', message: 'Network connection to external IP', severity: 'INFO' },
  { id: 'evt-1029', timestamp: '2023-10-26T14:26:15.000Z', source_ip: '192.168.1.105', dest_ip: '-', event_id: 1, process_name: 'powershell.exe', message: 'Powershell executing base64 encoded command', severity: 'WARN' },
];

export const DEFAULT_YARA_RULE = `rule Suspicious_Powershell_Emotet {
    meta:
        description = "Detects encoded command execution often used by Emotet"
        author = "OmniNexus_SOC"
        severity = "High"
    strings:
        $s1 = "powershell.exe" nocase
        $s2 = "-enc"
        $s3 = "hidden"
        $ioc_ip = "10.0.0.5" 
    condition:
        any of them
}`;

export const DEFAULT_YARA_TARGET = `Process started: cmd.exe /c powershell.exe -WindowStyle Hidden -Enc BASE64ENCODEDCOMMAND... connecting to 10.0.0.5`;

// 4. Data Center Mocks
export const MOCK_DB_SCHEMAS: DatabaseSchema[] = [
  { name: 'public', owner: 'postgres', tables: 42, size: '4.2 MB', status: 'ONLINE', connections: 5 },
  { name: 'dispatch', owner: 'dispatch_user', tables: 128, size: '245 MB', status: 'ONLINE', connections: 12 },
  { name: 'hexstrike', owner: 'hex_admin', tables: 56, size: '89 MB', status: 'ONLINE', connections: 3 },
  { name: 'mealie', owner: 'mealie_user', tables: 32, size: '450 MB', status: 'ONLINE', connections: 8 },
  { name: 'nemesis', owner: 'nemesis_svc', tables: 210, size: '1.2 GB', status: 'ONLINE', connections: 25 },
];

export const MOCK_DJANGO_SERVICES: DjangoService[] = [
  { appName: 'commander-spellbook', port: 8000, workers: 4, status: 'RUNNING', version: '4.2.7', pythonVersion: '3.11' },
  { appName: 'ghostwriter', port: 8001, workers: 2, status: 'RUNNING', version: '4.1.9', pythonVersion: '3.10' },
  { appName: 'nemesis', port: 8002, workers: 8, status: 'RUNNING', version: '4.2.5', pythonVersion: '3.11' },
];

export const MOCK_SQLITE_DBS: SqliteDatabase[] = [
    { name: 'c4_profiler.db', tool: 'Brute Ratel', path: '/opt/brute-ratel/data/', size: '156 MB', lastModified: '2m ago', status: 'READY' },
    { name: 'kasm_settings.db', tool: 'KasmVNC', path: '/etc/kasm/db/', size: '12 KB', lastModified: '1d ago', status: 'READY' },
    { name: 'maltrail_detected.db', tool: 'Maltrail', path: '/var/log/maltrail/', size: '1.2 GB', lastModified: '5s ago', status: 'LOCKED' },
    { name: 'database.sqlite', tool: 'n8n', path: '/home/node/.n8n/', size: '450 MB', lastModified: '10m ago', status: 'READY' },
];

export const MOCK_REDIS_DBS: RedisDatabase[] = [
    { index: 0, name: 'Dispatch cache', description: 'incident data', keys: 15420, memory: '124 MB', status: 'READY' },
    { index: 1, name: 'HexStrike cache', description: 'analysis results', keys: 8450, memory: '68 MB', status: 'READY' },
    { index: 2, name: 'Mealie cache', description: 'recipe data', keys: 1205, memory: '12 MB', status: 'READY' },
    { index: 3, name: 'Nemesis job queues', description: 'RabbitMQ alternative', keys: 45, memory: '8 MB', status: 'READY' },
    { index: 4, name: 'Ghostwriter sessions', description: 'Django sessions', keys: 312, memory: '24 MB', status: 'READY' },
    { index: 5, name: 'HELK temp data', description: 'log processing', keys: 89000, memory: '1.4 GB', status: 'SAVING' },
    { index: 6, name: 'Firecrawl queues', description: 'BullMQ jobs', keys: 150, memory: '16 MB', status: 'READY' },
    { index: 7, name: 'MISP sessions', description: 'PHP sessions', keys: 48, memory: '4 MB', status: 'READY' },
    { index: 8, name: 'SecurityOnion cache', description: 'temp processing', keys: 23000, memory: '512 MB', status: 'READY' },
    { index: 9, name: 'n8n cache', description: 'workflow state', keys: 670, memory: '34 MB', status: 'READY' },
];

export const MOCK_ELASTIC_INDICES: ElasticIndex[] = [
    { name: 'dispatch-events-2023', health: 'green', docs: 15420, size: '450 MB', app: 'Dispatch' },
    { name: 'nemesis-files-v1', health: 'green', docs: 8900, size: '1.2 GB', app: 'Nemesis' },
    { name: 'logs-helk-winlogbeat-2023.10', health: 'green', docs: 1250000, size: '15 GB', app: 'HELK' },
    { name: 'misp-events-index', health: 'yellow', docs: 45000, size: '600 MB', app: 'MISP' },
    { name: 'so-ids-alerts-2023', health: 'green', docs: 3400, size: '120 MB', app: 'SecurityOnion' },
];

// 5. Gaming Collection Mocks
export const MOCK_COLLECTION: CardCollectionItem[] = [
    { id: 'mtg-1', game: 'MTG', name: 'Black Lotus', setName: 'Unlimited', cardNumber: '232', quantity: 1, condition: 'MP', isFoil: false, price: 12500.00, purchasePrice: 4000 },
    { id: 'mtg-2', game: 'MTG', name: 'Sol Ring', setName: 'Commander Masters', cardNumber: '001', quantity: 4, condition: 'NM', isFoil: true, price: 2.50 },
    { id: 'mtg-3', game: 'MTG', name: 'The One Ring', setName: 'LTR', cardNumber: '246', quantity: 2, condition: 'NM', isFoil: true, price: 65.00, purchasePrice: 40 },
    { id: 'pk-1', game: 'POKEMON', name: 'Charizard', setName: 'Base Set', cardNumber: '4/102', quantity: 1, condition: 'LP', isFoil: true, price: 350.00, purchasePrice: 100 },
    { id: 'pk-2', game: 'POKEMON', name: 'Iono', setName: 'Paldea Evolved', cardNumber: '269', quantity: 3, condition: 'NM', isFoil: true, price: 85.00 },
    { id: 'orc-1', game: 'LORCANA', name: 'Elsa - Spirit of Winter', setName: 'The First Chapter', cardNumber: '42', quantity: 2, condition: 'NM', isFoil: true, price: 450.00, purchasePrice: 50 },
    { id: 'orc-2', game: 'LORCANA', name: 'Mickey Mouse - Brave Little Tailor', setName: 'The First Chapter', cardNumber: '115', quantity: 4, condition: 'NM', isFoil: false, price: 25.00 },
    { id: 'ff-1', game: 'FFTCG', name: 'Cloud Strife', setName: 'Opus I', cardNumber: '1-182L', quantity: 1, condition: 'NM', isFoil: true, price: 120.00, purchasePrice: 30 },
];

// 6. Productivity & Finance Mocks
export const MOCK_BUDGETS: Budget[] = [
  { category: 'HOUSING', limit: 2000, spent: 1950, period: 'MONTHLY' },
  { category: 'FOOD', limit: 600, spent: 450, period: 'MONTHLY' },
  { category: 'GAMING', limit: 500, spent: 420, period: 'MONTHLY' }, // Low budget remaining ($80)
  { category: 'TECH', limit: 1000, spent: 300, period: 'MONTHLY' },   // Healthy budget remaining ($700)
  { category: 'SAVINGS', limit: 1000, spent: 1000, period: 'MONTHLY' },
  { category: 'UTILITIES', limit: 300, spent: 280, period: 'MONTHLY' }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-27', merchant: 'TCGPlayer', amount: 45.50, category: 'GAMING', source: 'BANK_SYNC' },
  { id: 't2', date: '2023-10-26', merchant: 'AWS Services', amount: 120.00, category: 'TECH', source: 'BANK_SYNC' },
  { id: 't3', date: '2023-10-25', merchant: 'Whole Foods', amount: 135.20, category: 'FOOD', source: 'BANK_SYNC' },
  { id: 't4', date: '2023-10-24', merchant: 'Local Game Store', amount: 80.00, category: 'GAMING', source: 'MANUAL' },
  { id: 't5', date: '2023-10-22', merchant: 'Steam', amount: 59.99, category: 'GAMING', source: 'BANK_SYNC' },
];

// 7. Life Ops Mocks
export const MOCK_MEAL_PLAN: MealPlan[] = [
    { date: '2023-10-27', mealType: 'Dinner', recipeName: 'Spicy Salmon Rice Bowls', missingIngredients: ['Green Onions', 'Sriracha'], prepTime: '25 min' },
    { date: '2023-10-28', mealType: 'Lunch', recipeName: 'Chicken Avocado Wrap', missingIngredients: [], prepTime: '10 min' }
];

export const MOCK_CYBER_NEWS: NewsItem[] = [
    { id: 'n1', title: 'New zero-day in widely used VPN appliance detected', source: 'The Hacker News', timestamp: '1h ago', severity: 'CRITICAL' },
    { id: 'n2', title: 'Lorcana Set 3 spoilers reveal meta-shifting cards', source: 'TCG Infinite', timestamp: '3h ago', severity: 'INFO' },
    { id: 'n3', title: 'PostgreSQL 16.1 Release Notes - Performance Gains', source: 'DB Weekly', timestamp: '5h ago', severity: 'INFO' },
];

// 8. AI Lab Mocks (Workflows & Crawler)
export const MOCK_WORKFLOWS: NexusWorkflow[] = [
    {
        id: 'wf-1',
        name: 'Daily Cyber Briefing',
        description: 'Compiles recent MISP high-severity events and checks HELK for related hits.',
        trigger: 'SCHEDULE',
        enabled: true,
        lastRun: '14 hours ago',
        steps: [
            { id: 's1', name: 'Fetch High Sev MISP', type: 'QUERY_DB', config: 'SELECT * FROM misp WHERE severity="HIGH" AND date=TODAY' },
            { id: 's2', name: 'Cross-Ref HELK', type: 'LLM_ANALYSIS', config: 'Analyze HELK logs for IOC matches' },
            { id: 's3', name: 'Generate Report', type: 'LLM_ANALYSIS', config: 'Summarize findings for user' }
        ]
    },
    {
        id: 'wf-2',
        name: 'FNM Deck Prep',
        description: 'Checks TCGPlayer for price spikes in current deck lists every Friday.',
        trigger: 'SCHEDULE',
        enabled: false,
        lastRun: '6 days ago',
        steps: [
            { id: 's1', name: 'Get Decklist', type: 'QUERY_DB', config: 'Gaming.ActiveDeck' },
            { id: 's2', name: 'Scrape Prices', type: 'HTTP_REQUEST', config: 'GET tcgplayer.com/mass-entry' },
            { id: 's3', name: 'Alert if Value > $500', type: 'SEND_ALERT', config: 'Notify User' }
        ]
    }
];

export const MOCK_CRAWLER_TASKS: CrawlerTask[] = [
    { id: 'ct-1', url: 'https://tcgplayer.com/new-set-spoilers', targetType: 'TCG_CARD', status: 'COMPLETED', progress: 100, resultSummary: 'Found 12 new cards for Lorcana Set 4.' },
    { id: 'ct-2', url: 'https://alienvault.com/blog/apt29-campaign', targetType: 'THREAT_INTEL', status: 'PARSING', progress: 45, resultSummary: 'Extracting IOCs...' },
    { id: 'ct-3', url: 'https://cooking.nytimes.com/recipes/salmon', targetType: 'RECIPE', status: 'PENDING', progress: 0 }
];

export const getWorkflowHints = (): NexusWorkflow[] => {
    // Logic to suggest workflows based on recent activity (mocked)
    return [
        {
            id: 'sugg-1',
            name: 'Auto-Archive HELK Logs',
            description: 'You perform manual backups every Sunday. Automate this?',
            trigger: 'SCHEDULE',
            enabled: false,
            steps: []
        },
        {
            id: 'sugg-2',
            name: 'Monitor "Black Lotus" Price',
            description: 'You viewed this card 4 times today. Set up a price alert?',
            trigger: 'EVENT',
            enabled: false,
            steps: []
        }
    ];
};

// 7. Calendar Aggregation Helpers & Procedural Generation
export const getAggregatedCalendarEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // Helper to assign a fake time based on string hash for deterministic "random" time
  const getTime = (str: string, hourStart: number, hourEnd: number) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      const hour = Math.abs(hash) % (hourEnd - hourStart) + hourStart;
      const min = (Math.abs(hash) % 4) * 15; // 00, 15, 30, 45
      return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  // A. Transactions (Finance) - existing base mocks
  MOCK_TRANSACTIONS.forEach(tx => {
    events.push({
      id: `cal-tx-${tx.id}`,
      title: `${tx.merchant}`,
      date: tx.date,
      time: getTime(tx.id, 9, 20),
      type: 'TRANSACTION',
      description: `Spent $${tx.amount} on ${tx.category}`,
      meta: { amount: -tx.amount, category: tx.category }, // Negative for expense
      source: 'LOCAL'
    });
  });

  // B. Cyber Incidents (MISP) - existing base mocks
  MOCK_MISP_EVENTS.forEach(evt => {
    events.push({
      id: `cal-misp-${evt.id}`,
      title: `Threat: ${evt.org}`,
      date: evt.date,
      time: getTime(evt.id, 0, 23),
      type: 'CYBER_INCIDENT',
      description: evt.info,
      meta: { severity: evt.threat_level_id },
      source: 'LOCAL'
    });
  });

  // --- PROCEDURAL GENERATION FOR ROBUST TEST DATA (Prev, Current, Next Months) ---
  const today = new Date();
  
  // Generate for -1, 0, +1 months
  for (let offset = -1; offset <= 1; offset++) {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + offset;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        // Construct YYYY-MM-DD safely handling month boundaries
        const dateObj = new Date(currentYear, currentMonth, day);
        const dateStr = dateObj.toISOString().split('T')[0];
        const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon...

        // 1. Recurring Gaming Events
        if (dayOfWeek === 5) { // Friday
            events.push({ id: `gen-game-fnm-${dateStr}`, title: 'FNM: Standard', date: dateStr, time: '18:30', type: 'TCG_EVENT', description: 'Friday Night Magic at LGS', source: 'GOOGLE_CAL' });
        }
        if (dayOfWeek === 3) { // Wednesday
            events.push({ id: `gen-game-edh-${dateStr}`, title: 'Commander Night', date: dateStr, time: '19:00', type: 'TCG_EVENT', description: 'Casual EDH Pods', source: 'LOCAL' });
        }

        // 2. Recurring Infra Maintenance
        if (dayOfWeek === 0) { // Sunday
            events.push({ id: `gen-infra-backup-${dateStr}`, title: 'Full DB Backup', date: dateStr, time: '02:00', type: 'INFRA_MAINTENANCE', description: 'Weekly Automated Backup (Postgres + Redis)', meta: { severity: 'LOW' }, source: 'LOCAL' });
        }

        // 3. Daily/Random Cyber Traffic
        if (Math.random() > 0.8) { 
            events.push({ id: `gen-cyber-scan-${dateStr}`, title: 'Port Scan Detected', date: dateStr, time: getTime(`scan-${dateStr}`, 0, 23), type: 'CYBER_INCIDENT', description: 'Blocked IP 103.22.x.x scanning port 22', meta: { severity: 'LOW' }, source: 'LOCAL' });
        }
        if (Math.random() > 0.95) { 
            events.push({ id: `gen-cyber-spike-${dateStr}`, title: 'Traffic Anomaly', date: dateStr, time: getTime(`spike-${dateStr}`, 10, 16), type: 'CYBER_INCIDENT', description: 'Outbound traffic spike > 500MB', meta: { severity: 'HIGH' }, source: 'LOCAL' });
        }

        // 4. Daily Finance (Coffee/Lunch) - Expense
        if (dayOfWeek > 0 && dayOfWeek < 6) { // Weekdays
            events.push({ 
                id: `gen-fin-coffee-${dateStr}`, title: 'Starbucks', date: dateStr, time: '08:45', type: 'TRANSACTION', 
                description: 'Coffee', meta: { amount: -5.50, category: 'FOOD' }, source: 'LOCAL' 
            });
            
            if (Math.random() > 0.7) {
                events.push({ 
                    id: `gen-fin-lunch-${dateStr}`, title: 'Lunch', date: dateStr, time: '12:30', type: 'TRANSACTION', 
                    description: 'Local Deli', meta: { amount: -15.00, category: 'FOOD' }, source: 'LOCAL' 
                });
            }
        }

        // 5. Income Events (15th and 30th)
        if (day === 15 || day === 30) {
            events.push({
                id: `gen-fin-income-${dateStr}`, title: 'Paycheck', date: dateStr, time: '06:00', type: 'TRANSACTION',
                description: 'Direct Deposit', meta: { amount: 2500.00, category: 'INCOME' }, source: 'LOCAL'
            });
        }
      }
  }

  return events;
};

export const getGlobalContext = () => {
    return {
        mispEvents: MOCK_MISP_EVENTS,
        helkLogs: MOCK_HELK_LOGS,
        yaraRules: [DEFAULT_YARA_RULE],
        activeThreats: ['Emotet', 'APT28'],
        dbStatus: { 
            schemas: MOCK_DB_SCHEMAS, 
            services: MOCK_DJANGO_SERVICES,
            sqlite: MOCK_SQLITE_DBS,
            redis: MOCK_REDIS_DBS,
            elastic: MOCK_ELASTIC_INDICES
        },
        collection: MOCK_COLLECTION,
        finance: {
            budgets: MOCK_BUDGETS,
            recentTransactions: MOCK_TRANSACTIONS
        },
        calendar: getAggregatedCalendarEvents(),
        meals: MOCK_MEAL_PLAN,
        news: MOCK_CYBER_NEWS,
        workflows: MOCK_WORKFLOWS,
        crawlerTasks: MOCK_CRAWLER_TASKS
    };
};
