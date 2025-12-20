# Security Domain

This domain contains all security-focused modules including:
- Ghostwriter (Red Team C2 & Reporting)
- Nemesis (Offensive Security Platform)
- MISP (Threat Intelligence Platform)
- Dispatch (Incident Management)
- YARA-X (Malware Pattern Matching)
- Maltrail (Malicious Traffic Detection)
- RITA (Beacon Detection)
- HELK (Hunting ELK Stack)
- CyberChef (Data Analysis)
- MalwareBazaar MCP Server
- VirusTotal MCP Server

## Architecture

Each module in this domain is independently deployable and maintains its own:
- Database schemas
- API endpoints
- Frontend (if applicable)
- Docker containers
- Tests

## Dependencies

Modules within this domain should NOT import code from other modules.
Communication between modules should use events, API calls, or GraphQL federation.
