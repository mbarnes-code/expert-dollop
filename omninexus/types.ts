
export enum DomainType {
  DASHBOARD = 'DASHBOARD',
  CYBER = 'CYBER',
  GAMING = 'GAMING',
  PRODUCTIVITY = 'PRODUCTIVITY',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  AI_LAB = 'AI_LAB'
}

export enum ToolCategory {
  FORENSICS = 'FORENSICS',
  OFFENSIVE = 'OFFENSIVE',
  DEFENSIVE = 'DEFENSIVE',
  ANALYSIS = 'ANALYSIS',
  DECK_BUILDING = 'DECK_BUILDING',
  FINANCE = 'FINANCE',
  AUTOMATION = 'AUTOMATION',
  UTILITY = 'UTILITY'
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  repo: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  suggestedAction?: DomainType;
  mode?: 'CLOUD' | 'LOCAL'; // Track which AI generated this
}

export interface SystemMetric {
  name: string;
  value: number;
  status: 'nominal' | 'warning' | 'critical';
}

export interface NxProject {
  name: string;
  domain: DomainType;
  tags: string[];
  status: 'cached' | 'building' | 'failed' | 'success';
  lastBuild: string;
  estimatedCost?: number; // Cloud resource cost
}

export interface GatewayRoute {
  path: string;
  service: string;
  method: 'GET' | 'POST' | 'ANY';
  status: 'active' | 'inactive';
  latency: number;
}

// --- DATABASE & BACKEND TYPES ---
export interface DatabaseSchema {
  name: string;
  owner: string;
  tables: number;
  size: string;
  status: 'ONLINE' | 'OFFLINE' | 'MIGRATING';
  connections: number;
}

export interface DjangoService {
  appName: string;
  port: number;
  workers: number;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  version: string;
  pythonVersion: string;
}

export interface SqliteDatabase {
  name: string;
  tool: string;
  path: string;
  size: string;
  lastModified: string;
  status: 'READY' | 'LOCKED' | 'CORRUPT';
}

export interface RedisDatabase {
  index: number;
  name: string;
  description: string;
  keys: number;
  memory: string;
  status: 'READY' | 'LOADING' | 'SAVING';
}

export interface ElasticIndex {
  name: string;
  health: 'green' | 'yellow' | 'red';
  docs: number;
  size: string;
  app: string;
}

// CyberChef Specific Types
export interface ChefOperation {
  id: string;
  name: string;
  func: (input: string) => string;
  category: 'Encryption' | 'Encoding' | 'Utils';
}

export interface ChefRecipeItem {
  id: string; // Unique ID for the recipe step
  opId: string; // ID of the operation
}

export interface SavedRecipe {
  id: string;
  name: string;
  items: ChefRecipeItem[];
  timestamp: number;
}

// Yara Specific Types
export interface YaraScanResult {
  ruleName: string;
  matches: string[];
  status: 'MATCH' | 'NO_MATCH' | 'ERROR';
  timestamp: number;
}

// HELK Specific Types
export interface HelkLogEntry {
  id: string;
  timestamp: string;
  source_ip: string;
  dest_ip: string;
  event_id: number;
  process_name: string;
  message: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
}

// MISP Specific Types
export interface MispEvent {
  id: string;
  uuid: string;
  date: string;
  org: string;
  info: string;
  threat_level_id: '1' | '2' | '3' | '4'; // 1=High, 2=Medium, 3=Low, 4=Undefined
  analysis: '0' | '1' | '2'; // 0=Initial, 1=Ongoing, 2=Completed
  distribution: string;
  attribute_count: number;
  tags: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  severity: 'INFO' | 'HIGH' | 'CRITICAL';
}

// --- SWARM AI TYPES ---
export type AgentRole = 'OVERLORD' | 'HUNTER' | 'ORACLE' | 'WEAVER' | 'CONSTRUCT';

export interface SwarmAgent {
  id: string;
  role: AgentRole;
  name: string;
  status: 'IDLE' | 'THINKING' | 'OFFLINE';
  endpoint: string; // e.g. localhost:8000/v1
  contextWindow: number;
}

export interface SwarmTask {
  id: string;
  description: string;
  assignedTo: AgentRole;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  result?: string;
}

// --- GAMING TYPES ---
export type TcgGame = 'MTG' | 'POKEMON' | 'LORCANA' | 'FFTCG';

export interface DeckStat {
  label: string;
  value: string;
}

export interface CurvePoint {
  cost: string;
  count: number;
}

export interface CardCollectionItem {
  id: string;
  game: TcgGame;
  name: string;
  setName: string;
  cardNumber: string;
  quantity: number;
  condition: 'NM' | 'LP' | 'MP' | 'HP';
  isFoil: boolean;
  price: number; // Current market price
  purchasePrice?: number;
}

// --- PRODUCTIVITY / BUDGET TYPES ---
export type BudgetCategory = 'HOUSING' | 'FOOD' | 'GAMING' | 'TECH' | 'SAVINGS' | 'UTILITIES';

export interface Budget {
  category: BudgetCategory;
  limit: number;
  spent: number;
  period: 'MONTHLY';
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: BudgetCategory;
  source: 'BANK_SYNC' | 'PDF_IMPORT' | 'MANUAL';
}

export interface MealPlan {
  date: string;
  mealType: 'Dinner' | 'Lunch';
  recipeName: string;
  missingIngredients: string[];
  prepTime: string;
}

// --- CALENDAR TYPES ---
export type CalendarEventType = 'TRANSACTION' | 'TCG_EVENT' | 'CYBER_INCIDENT' | 'INFRA_MAINTENANCE' | 'GENERAL';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: CalendarEventType;
  description?: string;
  meta?: any; // Stores amount, severity, etc.
  source: 'LOCAL' | 'GOOGLE_CAL';
}

// --- AI LAB TYPES (WORKFLOW & CRAWLER) ---
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'QUERY_DB' | 'RUN_SCRIPT' | 'SEND_ALERT' | 'HTTP_REQUEST' | 'LLM_ANALYSIS';
  config: string;
}

export interface NexusWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'SCHEDULE' | 'MANUAL' | 'EVENT';
  enabled: boolean;
  steps: WorkflowStep[];
  lastRun?: string;
}

export interface CrawlerTask {
  id: string;
  url: string;
  targetType: 'RECIPE' | 'THREAT_INTEL' | 'TCG_CARD';
  status: 'PENDING' | 'CRAWLING' | 'PARSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  resultSummary?: string;
}