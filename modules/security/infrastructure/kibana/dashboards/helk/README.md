# HELK Dashboards

This directory contains Kibana dashboards for Windows threat hunting (HELK).

## Dashboards

### Threat Hunting
- **Windows Process Execution**: Process creation, command line analysis, parent-child relationships
- **Network Activity**: Network connections from Windows hosts, DNS queries, external connections
- **Authentication**: Logon events, failed authentication, privilege escalation
- **PowerShell Activity**: PowerShell execution, script block logging, suspicious commands

### Sysmon Monitoring
- **File Creation**: New executables, suspicious file locations, file hashes
- **Registry Changes**: Registry modifications, persistence mechanisms
- **Network Connections**: Process network activity, suspicious destinations
- **Image Loading**: DLL loading, suspicious modules

### Security Events
- **Account Management**: User creation, group changes, password resets
- **System Events**: Service installation, scheduled tasks, system changes
- **Lateral Movement**: Remote logon, network shares, remote execution

## Installation

Dashboards will be automatically imported on Kibana startup via saved objects API.

## Usage

```bash
# Access dashboards
http://localhost:5601/app/dashboards

# Filter by tag
Tag: HELK, Windows, Threat-Hunting
```

## Data Sources

- Windows Event Logs (Security, System, Application)
- Sysmon Event Logs
- PowerShell Logs
- WMI Logs

## Index Patterns

- `winlogbeat-*`
- `sysmon-*`
- `powershell-*`
