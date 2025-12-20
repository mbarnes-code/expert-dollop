
import { SwarmAgent, SwarmTask, AgentRole, DomainType } from '../types';

// Configuration for Local vLLM Endpoints
// In a real scenario, these would point to docker containers exposed on different ports
const SWARM_CONFIG: SwarmAgent[] = [
  { id: 'agent-0', role: 'OVERLORD', name: 'Head Agent', status: 'IDLE', endpoint: 'http://localhost:8000/v1', contextWindow: 32000 },
  { id: 'agent-1', role: 'HUNTER', name: 'Cyber Analyst', status: 'IDLE', endpoint: 'http://localhost:8001/v1', contextWindow: 8000 },
  { id: 'agent-2', role: 'ORACLE', name: 'Gaming/Knowledge', status: 'IDLE', endpoint: 'http://localhost:8002/v1', contextWindow: 8000 },
  { id: 'agent-3', role: 'WEAVER', name: 'Productivity/Scribe', status: 'IDLE', endpoint: 'http://localhost:8003/v1', contextWindow: 8000 },
  { id: 'agent-4', role: 'CONSTRUCT', name: 'Infra Engineer', status: 'IDLE', endpoint: 'http://localhost:8004/v1', contextWindow: 16000 },
];

class LocalSwarmManager {
  private agents: SwarmAgent[] = [...SWARM_CONFIG];
  private tasks: SwarmTask[] = [];
  private listeners: ((tasks: SwarmTask[], agents: SwarmAgent[]) => void)[] = [];

  // Simulate Network Latency for "Local" AI
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Head Agent Logic: Decompose Prompt ---
  private decomposePrompt(prompt: string): SwarmTask[] {
    const tasks: SwarmTask[] = [];
    const p = prompt.toLowerCase();

    // Heuristic routing (Simulating the Overlord's decision making)
    if (p.includes('scan') || p.includes('threat') || p.includes('malware') || p.includes('log')) {
      tasks.push({ id: Date.now() + '-1', description: 'Analyze security logs and threat indicators', assignedTo: 'HUNTER', status: 'PENDING' });
    }
    
    if (p.includes('deck') || p.includes('card') || p.includes('mana') || p.includes('combo')) {
      tasks.push({ id: Date.now() + '-2', description: 'Query Card Database and Optimize Synergy', assignedTo: 'ORACLE', status: 'PENDING' });
    }

    if (p.includes('server') || p.includes('deploy') || p.includes('build') || p.includes('gateway')) {
        tasks.push({ id: Date.now() + '-3', description: 'Check Infrastructure Status and Routes', assignedTo: 'CONSTRUCT', status: 'PENDING' });
    }

    // Default task: Summary/Writing
    tasks.push({ id: Date.now() + '-4', description: 'Synthesize findings and write response', assignedTo: 'WEAVER', status: 'PENDING' });

    return tasks;
  }

  // --- Execution Engine ---
  public async processPrompt(prompt: string): Promise<{ text: string, domain?: DomainType }> {
    // 1. Reset State
    this.tasks = [];
    this.updateAgentStatus('OVERLORD', 'THINKING');
    this.notify();

    await this.delay(800); // Overlord thinking time

    // 2. Head Agent Decomposes
    this.tasks = this.decomposePrompt(prompt);
    this.updateAgentStatus('OVERLORD', 'IDLE');
    this.notify();

    // 3. Dispatch to Swarm
    const results: string[] = [];
    
    // Execute tasks sequentially for visual clarity (parallel in real vLLM)
    for (const task of this.tasks) {
      task.status = 'IN_PROGRESS';
      this.updateAgentStatus(task.assignedTo, 'THINKING');
      this.notify();

      await this.delay(1500 + Math.random() * 1000); // Simulate processing time

      // Mock Agent Response (In reality, fetch(agent.endpoint))
      const output = this.mockAgentResponse(task);
      task.result = output;
      task.status = 'COMPLETED';
      results.push(`[${task.assignedTo}]: ${output}`);

      this.updateAgentStatus(task.assignedTo, 'IDLE');
      this.notify();
    }

    // 4. Final Aggregation
    const finalResponse = `**LOCAL SWARM EXECUTION COMPLETE**\n\n${results.join('\n\n')}`;
    
    // Determine domain based on who did the work
    let domain: DomainType | undefined = undefined;
    if (this.tasks.some(t => t.assignedTo === 'HUNTER')) domain = DomainType.CYBER;
    else if (this.tasks.some(t => t.assignedTo === 'ORACLE')) domain = DomainType.GAMING;
    else if (this.tasks.some(t => t.assignedTo === 'CONSTRUCT')) domain = DomainType.INFRASTRUCTURE;

    return { text: finalResponse, domain };
  }

  private updateAgentStatus(role: AgentRole, status: 'IDLE' | 'THINKING' | 'OFFLINE') {
    const agent = this.agents.find(a => a.role === role);
    if (agent) agent.status = status;
  }

  private mockAgentResponse(task: SwarmTask): string {
    switch(task.assignedTo) {
      case 'HUNTER': return "Scanned 500 HELK logs. Detected 1 IOC match for 'Emotet'. Recommended Action: Isolate Host 192.168.1.105.";
      case 'ORACLE': return "Found 3 infinite combos for 'Kinnan, Bonder Prodigy'. Mana curve optimal at 2.4 CMC.";
      case 'CONSTRUCT': return "Kong Gateway reports 98% uptime. 3 Docker containers rebuilding. Firecrawl MCP active.";
      case 'WEAVER': return "Report generated. Summary: Critical threat detected in Cyber sector. Infrastructure stable but under load. Gaming sector nominal.";
      default: return "Task acknowledged.";
    }
  }

  // --- Subscription for UI ---
  public subscribe(listener: (tasks: SwarmTask[], agents: SwarmAgent[]) => void) {
    this.listeners.push(listener);
    listener(this.tasks, this.agents); // Initial emit
  }

  public unsubscribe(listener: (tasks: SwarmTask[], agents: SwarmAgent[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this.tasks, [...this.agents]));
  }

  public getAgents() { return this.agents; }
}

export const localSwarm = new LocalSwarmManager();
