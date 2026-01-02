#!/bin/bash

# Repository Cloning Script
# This script clones various repositories organized by category

set -e  # Exit on any error

# Ensure we're running from the features directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting repository cloning process..."
echo "Working directory: $(pwd)"
echo "================================="

# Function to clone a repository with error handling
clone_repo() {
    local repo="$1"
    local description="$2"
    
    echo "Cloning $repo ($description)..."
    if gh repo clone "$repo"; then
        echo "✓ Successfully cloned $repo"
    else
        echo "✗ Failed to clone $repo"
        return 1
    fi
    echo ""
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated with gh
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI. Please run 'gh auth login' first."
    exit 1
fi

echo "Cloning cyber security tools..."
echo "------------------------------"
clone_repo "arismelachroinos/lscript" "Linux Security Script"
clone_repo "Cyb3rWard0g/HELK" "Hunting ELK Stack"
clone_repo "CorentinTh/it-tools" "IT Tools Collection"
clone_repo "gchq/CyberChef" "Cyber Swiss Army Knife"
clone_repo "VirusTotal/yara-x" "YARA-X Pattern Matching"
clone_repo "MISP/MISP" "Malware Information Sharing Platform"
clone_repo "stamparm/maltrail" "Malicious Traffic Detection"
clone_repo "Netflix/dispatch" "Incident Response Platform"
clone_repo "omnissa-archive/software-forensic-kit" "Software Forensic Kit"
clone_repo "paranoidninja/Brute-Ratel-C4-Community-Kit" "Brute Ratel C4 Community Kit"
clone_repo "rapid7/meterpreter" "Meterpreter Payload"
clone_repo "jackind424/onex" "OneX Security Tool"
clone_repo "SpecterOps/Nemesis" "Offensive Security Platform"
clone_repo "GhostManager/Ghostwriter" "Phishing Campaign Management"
clone_repo "Security-Onion-Solutions/securityonion" "Security Onion Platform"

echo "Cloning general tools..."
echo "----------------------"
clone_repo "actualbudget/actual" "Budget Management Tool"
clone_repo "kasmtech/KasmVNC" "Web-based VNC"
clone_repo "modelcontextprotocol/inspector" "MCP Inspector"
clone_repo "firecrawl/firecrawl" "Web Scraping Tool"
clone_repo "block/goose" "AI Development Tool"
clone_repo "mealie-recipes/mealie" "Recipe Management"

echo "Cloning MTG tools..."
echo "------------------"
clone_repo "SpaceCowMedia/commander-spellbook-backend" "MTG Commander Spellbook Backend"
clone_repo "SpaceCowMedia/commander-spellbook-site" "MTG Commander Spellbook Site"
clone_repo "jett-crowdis/mtg-commander-map" "MTG Commander Map"
clone_repo "ahmattox/mtg-scripting-toolkit" "MTG Scripting Toolkit"

echo "Cloning API tools..."
echo "------------------"
clone_repo "danielplohmann/apiscout" "API Scouting Tool"
clone_repo "Kong/kong" "API Gateway"

echo "Cloning MCP tools..."
echo "------------------"
clone_repo "0x4m4/hexstrike-ai" "HexStrike AI"
clone_repo "firecrawl/firecrawl-mcp-server" "Firecrawl MCP Server"
clone_repo "mytechnotalent/MalwareBazaar_MCP" "MalwareBazaar MCP"
clone_repo "chroma-core/chroma-mcp" "Chroma MCP"
clone_repo "leonardsellem/n8n-mcp-server" "n8n MCP Server"
clone_repo "BurtTheCoder/mcp-virustotal" "VirusTotal MCP"
clone_repo "admica/FileScopeMCP" "FileScope MCP"

echo "Cloning separate repos..."
echo "-----------------------"
clone_repo "n8n-io/n8n" "n8n Workflow Automation"
clone_repo "inthecyber-group/securityonion-n8n-workflows" "Security Onion n8n Workflows"
clone_repo "BlackArch/blackarch" "BlackArch Linux"
clone_repo "activecm/rita" "Real Intelligence Threat Analytics"

echo "================================="
echo "Repository cloning process completed!"
echo "Check above for any failed clones."