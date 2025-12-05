/**
 * Logstash Configuration Service
 * Manages Logstash pipeline configurations for event correlation
 */

import { LogstashPipelineConfig, Pipeline } from '../domain/logstash-config.interface';

export abstract class LogstashConfigService {
  abstract getPipelineConfig(): LogstashPipelineConfig;
  abstract getPipelines(): Pipeline[];
  abstract getInputPipelines(): Pipeline[];
  abstract getFilterPipelines(): Pipeline[];
  abstract getOutputPipelines(): Pipeline[];
}

export class LogstashConfigServiceImpl extends LogstashConfigService {
  getPipelineConfig(): LogstashPipelineConfig {
    return {
      'pipeline.id': 'helk-main',
      'pipeline.workers': 4,
      'pipeline.batch.size': 125,
      'pipeline.batch.delay': 50,
      path: {
        config: '/usr/share/logstash/pipeline',
      },
      config: {
        reload: {
          automatic: true,
          interval: '3s',
        },
      },
    };
  }

  getPipelines(): Pipeline[] {
    return [
      ...this.getInputPipelines(),
      ...this.getFilterPipelines(),
      ...this.getOutputPipelines(),
    ];
  }

  getInputPipelines(): Pipeline[] {
    return [
      {
        name: 'kafka-input',
        path: 'resources/pipelines/0002-kafka-input.conf',
        priority: 2,
        type: 'input',
        description: 'Kafka input for distributed event collection',
      },
      {
        name: 'attack-input',
        path: 'resources/pipelines/0003-attack-input.conf',
        priority: 3,
        type: 'input',
        description: 'MITRE ATT&CK data input',
      },
      {
        name: 'beats-input',
        path: 'resources/pipelines/0004-beats-input.conf',
        priority: 4,
        type: 'input',
        description: 'Beats input (Winlogbeat, Filebeat)',
      },
      {
        name: 'syslog-tcp-input',
        path: 'resources/pipelines/0011-syslog-tcp-input.conf',
        priority: 11,
        type: 'input',
        description: 'Syslog TCP input',
      },
      {
        name: 'syslog-udp-input',
        path: 'resources/pipelines/0011-syslog-udp-input.conf',
        priority: 11,
        type: 'input',
        description: 'Syslog UDP input',
      },
    ];
  }

  getFilterPipelines(): Pipeline[] {
    return [
      {
        name: 'all-filter',
        path: 'resources/pipelines/0098-all-filter.conf',
        priority: 98,
        type: 'filter',
        description: 'Common filter for all events',
      },
      {
        name: 'fingerprint-hash-filter',
        path: 'resources/pipelines/0099-all-fingerprint-hash-filter.conf',
        priority: 99,
        type: 'filter',
        description: 'Event fingerprinting for deduplication',
      },
      {
        name: 'winevent-winlogbeats-filter',
        path: 'resources/pipelines/1010-winevent-winlogbeats-filter.conf',
        priority: 1010,
        type: 'filter',
        description: 'Windows event log filtering',
      },
      {
        name: 'sysmon-filter',
        path: 'resources/pipelines/1531-winevent-sysmon-filter.conf',
        priority: 1531,
        type: 'filter',
        description: 'Sysmon event processing',
      },
      {
        name: 'security-filter',
        path: 'resources/pipelines/1532-winevent-security-filter.conf',
        priority: 1532,
        type: 'filter',
        description: 'Windows Security event processing',
      },
      {
        name: 'powershell-filter',
        path: 'resources/pipelines/2511-winevent-powershell-filter.conf',
        priority: 2511,
        type: 'filter',
        description: 'PowerShell event analysis',
      },
      {
        name: 'zeek-filter',
        path: 'resources/pipelines/3101-zeek_corelight-all-filter.conf',
        priority: 3101,
        type: 'filter',
        description: 'Zeek/Corelight network data processing',
      },
      {
        name: 'network-community-id-filter',
        path: 'resources/pipelines/8911-fingerprints-network_community_id-filter.conf',
        priority: 8911,
        type: 'filter',
        description: 'Network community ID for correlation',
      },
    ];
  }

  getOutputPipelines(): Pipeline[] {
    return [
      {
        name: 'winevent-main-output',
        path: 'resources/pipelines/9949-winevent-main-output.conf',
        priority: 9949,
        type: 'output',
        description: 'Main Windows event output',
      },
      {
        name: 'winevent-sysmon-output',
        path: 'resources/pipelines/9950-winevent-sysmon-output.conf',
        priority: 9950,
        type: 'output',
        description: 'Sysmon output to dedicated index',
      },
      {
        name: 'winevent-security-output',
        path: 'resources/pipelines/9951-winevent-security-output.conf',
        priority: 9951,
        type: 'output',
        description: 'Security event output',
      },
      {
        name: 'attack-output',
        path: 'resources/pipelines/9956-attack-output.conf',
        priority: 9956,
        type: 'output',
        description: 'MITRE ATT&CK data output',
      },
      {
        name: 'catchall-output',
        path: 'resources/pipelines/9998-catch_all-output.conf',
        priority: 9998,
        type: 'output',
        description: 'Catch-all output for unmatched events',
      },
    ];
  }
}
