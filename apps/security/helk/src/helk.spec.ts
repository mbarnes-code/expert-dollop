/**
 * Simple validation test for HELK module
 */

import { getHELKOrchestrator } from '../src/index';
import { main as cliMain } from '../src/cli';

describe('HELK Module', () => {
  test('orchestrator should initialize', () => {
    const orchestrator = getHELKOrchestrator();
    expect(orchestrator).toBeDefined();
  });

  test('should get deployment config', () => {
    const orchestrator = getHELKOrchestrator();
    const config = orchestrator.getDeploymentConfig();
    expect(config.name).toBe('HELK - Hunting ELK');
    expect(config.components.elasticsearch).toBe(true);
    expect(config.components.kibana).toBe(true);
    expect(config.components.logstash).toBe(true);
    expect(config.components.jupyter).toBe(true);
    expect(config.components.spark).toBe(true);
  });

  test('should get merged elasticsearch config', () => {
    const orchestrator = getHELKOrchestrator();
    const esService = orchestrator.getElasticsearchService();
    const config = esService.getMergedConfig();
    
    expect(config.network.host).toBe('0.0.0.0');
    expect(config.bootstrap?.memory_lock).toBe(true);
    expect(config.xpack?.security.enabled).toBe(true);
    expect(config.xpack?.monitoring?.collection?.enabled).toBe(true);
  });

  test('should get kibana dashboards', () => {
    const orchestrator = getHELKOrchestrator();
    const kibanaService = orchestrator.getKibanaService();
    const dashboards = kibanaService.getDashboards();
    
    expect(dashboards.length).toBe(8);
    expect(dashboards[0].id).toBe('helk-global-dashboard');
  });

  test('should get logstash pipelines', () => {
    const orchestrator = getHELKOrchestrator();
    const logstashService = orchestrator.getLogstashService();
    const pipelines = logstashService.getPipelines();
    
    expect(pipelines.length).toBeGreaterThan(0);
    const inputPipelines = pipelines.filter(p => p.type === 'input');
    const filterPipelines = pipelines.filter(p => p.type === 'filter');
    const outputPipelines = pipelines.filter(p => p.type === 'output');
    
    expect(inputPipelines.length).toBeGreaterThan(0);
    expect(filterPipelines.length).toBeGreaterThan(0);
    expect(outputPipelines.length).toBeGreaterThan(0);
  });

  test('should get jupyter notebooks', () => {
    const orchestrator = getHELKOrchestrator();
    const jupyterService = orchestrator.getJupyterService();
    const notebooks = jupyterService.getNotebooks();
    
    expect(notebooks.length).toBeGreaterThan(0);
    const tutorials = notebooks.filter(n => n.category === 'tutorial');
    expect(tutorials.length).toBeGreaterThan(0);
  });

  test('should validate configuration', () => {
    const orchestrator = getHELKOrchestrator();
    const validation = orchestrator.validateConfiguration();
    
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test('should generate deployment manifest', () => {
    const orchestrator = getHELKOrchestrator();
    const manifest = orchestrator.generateDeploymentManifest();
    
    expect(manifest.metadata).toBeDefined();
    expect(manifest.components.elasticsearch).toBeDefined();
    expect(manifest.components.kibana).toBeDefined();
    expect(manifest.components.logstash).toBeDefined();
    expect(manifest.components.jupyter).toBeDefined();
    expect(manifest.components.spark).toBeDefined();
  });

  test('CLI config command should work', async () => {
    const result = await cliMain(['config']);
    expect(result).toBe(true);
  });

  test('CLI validate command should work', async () => {
    const result = await cliMain(['validate']);
    expect(result).toBe(true);
  });
});
