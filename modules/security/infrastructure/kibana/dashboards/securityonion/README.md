# Security Onion Dashboards

This directory contains Kibana dashboards for network security monitoring.

## Dashboards

### Network Overview
- **Network Traffic**: Volume, protocols, top talkers
- **Connection Analysis**: Session duration, data transfer, anomalies
- **Geographic View**: Source/destination countries, threat intelligence

### Zeek (Network Security Monitor)
- **Protocol Analysis**: HTTP, DNS, SSL/TLS, SSH, FTP
- **File Extraction**: Files observed, hash analysis, malware indicators
- **Weird Events**: Unusual protocol behavior, protocol violations

### Suricata (IDS/IPS)
- **Alert Dashboard**: IDS alerts by severity, signature, category
- **Attack Patterns**: Top attack types, targeted hosts, attack trends
- **Network Defense**: Blocked connections, threat mitigation

### Threat Intelligence
- **IOC Matching**: Known malicious IPs, domains, file hashes
- **Threat Hunting**: Behavioral anomalies, suspicious patterns
- **Incident Response**: Alert correlation, timeline analysis

## Installation

Dashboards will be automatically imported on Kibana startup via saved objects API.

## Usage

```bash
# Access dashboards
http://localhost:5601/app/dashboards

# Filter by tag
Tag: SecurityOnion, Network, IDS
```

## Data Sources

- Zeek (Bro) logs
- Suricata alerts and logs
- PCAP metadata
- Network flow data

## Index Patterns

- `zeek-*`
- `suricata-*`
- `pcap-*`
