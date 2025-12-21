/**
 * Kibana Configuration Service
 * Manages Kibana configurations and dashboards
 */

import { KibanaConfig, Dashboard } from '../domain/kibana-config.interface';

export abstract class KibanaConfigService {
  abstract getConfig(): KibanaConfig;
  abstract getDashboards(): Dashboard[];
}

export class KibanaConfigServiceImpl extends KibanaConfigService {
  getConfig(): KibanaConfig {
    return {
      server: {
        host: '0.0.0.0',
        port: 5601,
        name: 'helk-kibana',
        basePath: '/kibana',
      },
      elasticsearch: {
        hosts: ['https://elasticsearch:9200'],
        ssl: {
          verificationMode: 'none',
          certificateAuthorities: ['/usr/share/kibana/config/ca.crt'],
        },
      },
      logging: {
        quiet: false,
        verbose: false,
      },
      xpack: {
        monitoring: {
          enabled: true,
        },
      },
    };
  }

  getDashboards(): Dashboard[] {
    // Dashboards are loaded from resources/dashboards directory
    // These are the HELK default dashboards
    return [
      {
        id: 'helk-global-dashboard',
        title: 'Global Dashboard - HELK',
        description: 'Global overview of all events',
        panels: [],
        timeRestore: true,
      },
      {
        id: 'helk-sysmon-dashboard',
        title: 'Sysmon Dashboard - HELK',
        description: 'Sysmon event monitoring',
        panels: [],
        timeRestore: true,
      },
      {
        id: 'helk-mitre-attack-dashboard',
        title: 'ALL MITRE ATTACK - HELK',
        description: 'MITRE ATT&CK framework coverage',
        panels: [],
        timeRestore: true,
      },
      {
        id: 'helk-host-investigation-dashboard',
        title: 'Host Investigation Dashboard - HELK',
        description: 'Host-focused investigation view',
        panels: [],
        timeRestore: true,
      },
      {
        id: 'helk-process-investigation-dashboard',
        title: 'Process Investigation - HELK',
        description: 'Process-focused investigation view',
        panels: [],
        timeRestore: true,
      },
      {
        id: 'helk-user-investigation-dashboard',
        title: 'User Investigation Dashboard - HELK',
        description: 'User-focused investigation view',
        panels: [],
        timeRestore: true,
      },
      {
        id: 'helk-sysmon-network-dashboard',
        title: 'Sysmon Network Dashboard - HELK',
        description: 'Network activity from Sysmon',
        panels: [],
        timeRestore: true,
      },
      {
        id: 'helk-mitre-attack-groups-dashboard',
        title: 'MITRE ATTACK GROUPS - HELK',
        description: 'MITRE ATT&CK threat groups',
        panels: [],
        timeRestore: true,
      },
    ];
  }
}
