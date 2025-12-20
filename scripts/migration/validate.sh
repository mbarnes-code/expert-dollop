#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Migration Validation Script
# ════════════════════════════════════════════════════════════════════════════════
# Validates that the migration completed successfully
# Checks directory structure, files, and docker-compose configurations
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNED=0

# Function to print colored output
print_status() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Function to check if directory exists
check_dir() {
    local dir=$1
    local desc=$2
    
    if [ -d "${ROOT_DIR}/${dir}" ]; then
        print_status "${GREEN}" "  ✓ ${desc}"
        ((CHECKS_PASSED++))
        return 0
    else
        print_status "${RED}" "  ✗ ${desc}"
        ((CHECKS_FAILED++))
        return 1
    fi
}

# Function to check if file exists
check_file() {
    local file=$1
    local desc=$2
    
    if [ -f "${ROOT_DIR}/${file}" ]; then
        print_status "${GREEN}" "  ✓ ${desc}"
        ((CHECKS_PASSED++))
        return 0
    else
        print_status "${YELLOW}" "  ⚠ ${desc}"
        ((CHECKS_WARNED++))
        return 1
    fi
}

# Main validation
main() {
    cd "${ROOT_DIR}"
    
    print_status "${BLUE}" "╔════════════════════════════════════════════════════════════════════╗"
    print_status "${BLUE}" "║         Migration Validation Report                                ║"
    print_status "${BLUE}" "╚════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Check Phase 1: Domain Structure
    print_status "${BLUE}" "Phase 1: Domain Structure"
    check_dir "modules" "modules/ directory exists"
    check_dir "modules/security" "modules/security/ exists"
    check_dir "modules/tcg" "modules/tcg/ exists"
    check_dir "modules/productivity" "modules/productivity/ exists"
    check_dir "modules/workflow" "modules/workflow/ exists"
    check_dir "modules/ai" "modules/ai/ exists"
    check_dir "libs" "libs/ directory exists"
    check_dir "libs/typescript" "libs/typescript/ exists"
    check_dir "libs/python" "libs/python/ exists"
    check_dir "libs/rust" "libs/rust/ exists"
    check_dir "libs/go" "libs/go/ exists"
    echo ""
    
    # Check Phase 2: Security Domain
    print_status "${BLUE}" "Phase 2: Security Domain Modules"
    check_dir "modules/security/ghostwriter" "ghostwriter module exists"
    check_dir "modules/security/nemesis" "nemesis module exists"
    check_dir "modules/security/misp" "misp module exists"
    check_dir "modules/security/dispatch" "dispatch module exists"
    check_file "docker-compose.security.yml" "docker-compose.security.yml exists"
    check_file "modules/security/MIGRATION.md" "Security migration log exists"
    echo ""
    
    # Check Phase 3: TCG Domain
    print_status "${BLUE}" "Phase 3: TCG Domain Modules"
    check_dir "modules/tcg/commander-spellbook" "commander-spellbook module exists"
    check_dir "modules/tcg/commander-map" "commander-map module exists"
    check_dir "modules/tcg/scripting-toolkit" "scripting-toolkit module exists"
    check_file "docker-compose.tcg.yml" "docker-compose.tcg.yml exists"
    check_file "modules/tcg/MIGRATION.md" "TCG migration log exists"
    echo ""
    
    # Check Phase 4: Productivity Domain
    print_status "${BLUE}" "Phase 4: Productivity Domain Modules"
    check_dir "modules/productivity/mealie" "mealie module exists"
    check_dir "modules/productivity/actual" "actual module exists"
    check_dir "modules/productivity/it-tools" "it-tools module exists"
    check_file "docker-compose.productivity.yml" "docker-compose.productivity.yml exists"
    check_file "modules/productivity/MIGRATION.md" "Productivity migration log exists"
    echo ""
    
    # Check Phase 5: Workflow Domain
    print_status "${BLUE}" "Phase 5: Workflow Domain Modules"
    check_dir "modules/workflow/n8n" "n8n module exists"
    check_dir "modules/workflow/n8n-mcp" "n8n-mcp module exists"
    check_file "docker-compose.workflow.yml" "docker-compose.workflow.yml exists"
    check_file "modules/workflow/MIGRATION.md" "Workflow migration log exists"
    echo ""
    
    # Check Phase 6: AI Domain
    print_status "${BLUE}" "Phase 6: AI Domain Modules"
    check_dir "modules/ai/firecrawl" "firecrawl module exists"
    check_dir "modules/ai/goose" "goose module exists"
    check_dir "modules/ai/chroma-mcp" "chroma-mcp module exists"
    check_file "docker-compose.ai.yml" "docker-compose.ai.yml exists"
    check_file "modules/ai/MIGRATION.md" "AI migration log exists"
    echo ""
    
    # Check Backups
    print_status "${BLUE}" "Backup Files"
    check_file "docker-compose.yml.backup.phase2" "Phase 2 backup exists"
    check_file "docker-compose.yml.backup.phase3" "Phase 3 backup exists"
    check_file "docker-compose.yml.backup.phase4" "Phase 4 backup exists"
    check_file "docker-compose.yml.backup.phase5" "Phase 5 backup exists"
    check_file "docker-compose.yml.backup.phase6" "Phase 6 backup exists"
    echo ""
    
    # Summary
    print_status "${BLUE}" "╔════════════════════════════════════════════════════════════════════╗"
    print_status "${BLUE}" "║         Validation Summary                                         ║"
    print_status "${BLUE}" "╚════════════════════════════════════════════════════════════════════╝"
    echo ""
    print_status "${GREEN}" "  Checks Passed: ${CHECKS_PASSED}"
    if [ ${CHECKS_WARNED} -gt 0 ]; then
        print_status "${YELLOW}" "  Warnings: ${CHECKS_WARNED} (optional items missing)"
    fi
    if [ ${CHECKS_FAILED} -gt 0 ]; then
        print_status "${RED}" "  Checks Failed: ${CHECKS_FAILED}"
    fi
    echo ""
    
    # Final verdict
    if [ ${CHECKS_FAILED} -eq 0 ]; then
        print_status "${GREEN}" "╔════════════════════════════════════════════════════════════════════╗"
        print_status "${GREEN}" "║  ✓ Migration validation PASSED!                                    ║"
        print_status "${GREEN}" "╚════════════════════════════════════════════════════════════════════╝"
        echo ""
        print_status "${BLUE}" "Next steps:"
        print_status "${BLUE}" "  1. Test docker-compose builds for each domain"
        print_status "${BLUE}" "  2. Update CI/CD pipelines"
        print_status "${BLUE}" "  3. Update infrastructure references"
        print_status "${BLUE}" "  4. Commit the migration"
        echo ""
        return 0
    else
        print_status "${RED}" "╔════════════════════════════════════════════════════════════════════╗"
        print_status "${RED}" "║  ✗ Migration validation FAILED!                                    ║"
        print_status "${RED}" "╚════════════════════════════════════════════════════════════════════╝"
        echo ""
        print_status "${YELLOW}" "Some required directories or files are missing."
        print_status "${YELLOW}" "Please review the failed checks above and re-run the migration."
        echo ""
        return 1
    fi
}

# Run main function
main "$@"
