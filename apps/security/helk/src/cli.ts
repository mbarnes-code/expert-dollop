/**
 * HELK CLI Tool
 * Command-line interface for managing HELK deployment
 */

import { getHELKOrchestrator } from './index';
import { DeploymentManager } from './infrastructure/deployment';

function printUsage() {
  console.log(`
HELK Management CLI

Usage:
  helk config         - Display current configuration
  helk validate       - Validate configuration
  helk manifest       - Generate deployment manifest
  helk deploy [type]  - Deploy HELK (docker-compose or kubernetes)
  helk help           - Show this help message

Examples:
  helk config
  helk validate
  helk manifest > deployment.json
  helk deploy docker-compose
  `);
}

export async function main(args: string[] = []) {
  const command = args[0];

  const orchestrator = getHELKOrchestrator();
  const deploymentManager = new DeploymentManager();

  switch (command) {
    case 'config':
      console.log('=== HELK Configuration ===\n');
      console.log('Deployment Config:', JSON.stringify(orchestrator.getDeploymentConfig(), null, 2));
      console.log('\nElasticsearch Config:', JSON.stringify(
        orchestrator.getElasticsearchService().getMergedConfig(),
        null,
        2
      ));
      break;

    case 'validate':
      console.log('=== Validating Configuration ===\n');
      const validation = orchestrator.validateConfiguration();
      if (validation.valid) {
        console.log('✓ Configuration is valid');
      } else {
        console.log('✗ Configuration has errors:');
        validation.errors.forEach((error) => console.log(`  - ${error}`));
        return false;
      }
      break;

    case 'manifest':
      console.log(JSON.stringify(orchestrator.generateDeploymentManifest(), null, 2));
      break;

    case 'deploy':
      const strategyName = args[1] || 'docker-compose';
      console.log(`=== Deploying HELK with ${strategyName} ===\n`);
      
      try {
        const result = await deploymentManager.deploy(strategyName);
        if (result.success) {
          console.log('✓ Deployment successful');
          console.log('\nComponent Status:');
          result.components.forEach((comp) => {
            console.log(`  - ${comp.name}: ${comp.status}${comp.endpoint ? ` (${comp.endpoint})` : ''}`);
          });
        } else {
          console.log('✗ Deployment failed:', result.message);
          return false;
        }
      } catch (error) {
        console.error('✗ Deployment error:', error);
        return false;
      }
      break;

    case 'help':
    default:
      printUsage();
      break;
  }

  return true;
}
