# OmniNexus Dev Container

This dev container provides a comprehensive development environment for the OmniNexus monorepo, integrating all projects from the features directory into a unified workspace.

## Features

### Language Support
- **Python 3.12**: Full Python development environment with popular tools
- **Node.js 22**: Latest LTS version with pnpm package manager
- **Rust**: Stable Rust toolchain for Rust-based projects

### Development Tools
- **Docker-in-Docker**: Build and run containers within the dev container
- **GitHub CLI**: Manage GitHub resources from the command line
- **PostgreSQL Client**: Connect to PostgreSQL databases
- **VNC Server**: GUI application support when needed

### Python Tools Pre-installed
- black (formatter)
- ruff (linter)
- mypy (type checker)
- pylint (code analysis)
- pytest (testing)
- coverage (code coverage)

### VS Code Extensions Included
- Python development (Pylance, Black, Pylint, Ruff)
- JavaScript/TypeScript development (ESLint, Vue/Volar)
- Rust development (rust-analyzer, lldb)
- Git/GitHub integration
- EditorConfig support
- Resource monitoring

## Port Forwarding

The following ports are automatically forwarded:
- **3000**: Frontend development servers
- **5432**: PostgreSQL database
- **5678**: n8n automation platform
- **6080**: VNC web client (noVNC)
- **8000**: API services
- **8001**: Kong Gateway admin
- **8080**: Various web services
- **9000**: Additional services
- **9091**: Production services

## Requirements

### Host Machine
- **Memory**: Minimum 8GB RAM
- **CPU**: Minimum 8 cores
- **Docker**: Docker Desktop or Docker Engine

## Usage

### Opening in VS Code
1. Install the "Dev Containers" extension in VS Code
2. Open the repository folder
3. Click the green button in the bottom-left corner
4. Select "Reopen in Container"

### Opening in GitHub Codespaces
1. Click the "Code" button on GitHub
2. Select "Codespaces"
3. Click "Create codespace on main"

### First Time Setup

After the container is created, the `post-create.sh` script will:
1. Install pnpm dependencies from `package.json`
2. Install Python dependencies from `requirements.txt` or `pyproject.toml`
3. Configure useful bash aliases
4. Set up the development environment

### Manual Setup

If you need to reinstall dependencies:
```bash
# Install pnpm packages
pnpm install

# Install Python packages
pip install -r requirements.txt

# Or install from pyproject.toml
pip install -e .
```

## Configuration

### Customizing the Container

Edit `.devcontainer/devcontainer.json` to:
- Add more VS Code extensions
- Change port forwarding
- Modify environment variables
- Add additional features

### Customizing the Dockerfile

Edit `.devcontainer/Dockerfile` to:
- Install additional system packages
- Add more language runtimes
- Configure system-level settings

## Project Integration

This dev container is designed to support all projects in the `features/` directory:
- **mealie**: Recipe management (Python + Vue)
- **vscode**: VS Code development
- **kong**: API Gateway (Lua)
- **dispatch**: Incident management (Python + PostgreSQL)
- **CyberChef**: Data analysis (Node.js)
- **n8n**: Workflow automation (Node.js + TypeScript)
- **goose**: AI tools (Rust)
- **actual**: Budget management (Node.js)

## Mounted Volumes

- **node_modules**: Persistent volume for Node.js dependencies
- **bash history**: Persistent command history
- **SSH keys**: Shared from host machine (read-only)

## Troubleshooting

### Container won't build
1. Check Docker is running
2. Ensure you have enough disk space
3. Try rebuilding without cache: `Dev Containers: Rebuild Container`

### Port already in use
Check which ports are in use on your host machine and stop conflicting services.

### Slow performance
1. Ensure Docker has enough resources allocated
2. Use Docker volumes instead of bind mounts for large dependency folders
3. Close unused services

## Contributing

When adding new features to the monorepo:
1. Test in this dev container
2. Add any new port requirements to `forwardPorts`
3. Add language-specific extensions to `customizations.vscode.extensions`
4. Update this README with new project information

## License

This dev container configuration is part of the OmniNexus project.
