/**
 * HELK Module - Main Entry Point
 * Exports all domain models, services, and orchestrators
 */

// Domain Models
export * from './domain/elasticsearch-config.interface';
export * from './domain/kibana-config.interface';
export * from './domain/logstash-config.interface';
export * from './domain/jupyter-config.interface';

// Services
export * from './services/elasticsearch-config.service';
export * from './services/kibana-config.service';
export * from './services/logstash-config.service';
export * from './services/jupyter-config.service';
export * from './services/helk-orchestrator.service';

// Main Orchestrator Instance (Singleton)
import { HELKConfigOrchestrator } from './services/helk-orchestrator.service';

let orchestratorInstance: HELKConfigOrchestrator | null = null;

/**
 * Get singleton instance of HELK orchestrator
 */
export function getHELKOrchestrator(): HELKConfigOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new HELKConfigOrchestrator();
  }
  return orchestratorInstance;
}

/**
 * Reset orchestrator instance (for testing)
 */
export function resetHELKOrchestrator(): void {
  orchestratorInstance = null;
}
