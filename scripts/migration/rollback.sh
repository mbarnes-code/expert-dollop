#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Rollback Script - Complete Migration Rollback
# ════════════════════════════════════════════════════════════════════════════════
# Reverts all changes made by the migration scripts
# Can rollback all phases or specific phases
# ════════════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Function to print section header
print_header() {
    echo ""
    echo "════════════════════════════════════════════════════════════════════════════════"
    print_status "${BLUE}" "  $@"
    echo "════════════════════════════════════════════════════════════════════════════════"
    echo ""
}

# Function to rollback a specific phase
rollback_phase() {
    local phase_num=$1
    local domain=$2
    
    print_status "${YELLOW}" "Rolling back Phase ${phase_num}: ${domain}"
    
    # Remove the migrated modules directory
    if [ -d "${ROOT_DIR}/modules/${domain}" ]; then
        print_status "${BLUE}" "  Removing modules/${domain}/"
        rm -rf "${ROOT_DIR}/modules/${domain}"
    fi
    
    # Restore docker-compose backups
    if [ -f "${ROOT_DIR}/docker-compose.yml.backup.phase${phase_num}" ]; then
        print_status "${BLUE}" "  Restoring docker-compose.yml"
        mv "${ROOT_DIR}/docker-compose.yml.backup.phase${phase_num}" "${ROOT_DIR}/docker-compose.yml"
    fi
    
    if [ -f "${ROOT_DIR}/docker-compose.${domain}.yml.backup.phase${phase_num}" ]; then
        print_status "${BLUE}" "  Restoring docker-compose.${domain}.yml"
        mv "${ROOT_DIR}/docker-compose.${domain}.yml.backup.phase${phase_num}" "${ROOT_DIR}/docker-compose.${domain}.yml"
    fi
    
    print_status "${GREEN}" "  ✓ Phase ${phase_num} rolled back"
}

# Function to rollback Phase 1 (structure creation)
rollback_phase1() {
    print_status "${YELLOW}" "Rolling back Phase 1: Domain Structure"
    
    # Remove modules and libs directories
    if [ -d "${ROOT_DIR}/modules" ]; then
        print_status "${BLUE}" "  Removing modules/"
        rm -rf "${ROOT_DIR}/modules"
    fi
    
    if [ -d "${ROOT_DIR}/libs" ]; then
        print_status "${BLUE}" "  Removing libs/"
        rm -rf "${ROOT_DIR}/libs"
    fi
    
    print_status "${GREEN}" "  ✓ Phase 1 rolled back"
}

# Main rollback function
main() {
    print_header "Migration Rollback"
    
    cd "${ROOT_DIR}"
    
    # Check if there are any backups
    BACKUPS=$(find . -maxdepth 1 -name "docker-compose.*.backup.phase*" 2>/dev/null | wc -l)
    
    if [ "$BACKUPS" -eq 0 ]; then
        print_status "${YELLOW}" "No migration backups found. Nothing to rollback."
        exit 0
    fi
    
    print_status "${RED}" "WARNING: This will rollback your migration and restore the previous structure."
    print_status "${YELLOW}" ""
    print_status "${YELLOW}" "This will:"
    print_status "${YELLOW}" "  1. Remove all modules/ and libs/ directories"
    print_status "${YELLOW}" "  2. Restore docker-compose files from backups"
    print_status "${YELLOW}" "  3. You will need to manually restore moved files using git"
    print_status "${YELLOW}" ""
    
    read -p "Do you want to continue with rollback? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy](es)?$ ]]; then
        print_status "${YELLOW}" "Rollback cancelled."
        exit 0
    fi
    
    print_header "Starting Rollback Process"
    
    # Rollback in reverse order (Phase 6 to Phase 1)
    
    # Phase 6: AI Domain
    if [ -d "${ROOT_DIR}/modules/ai" ] || [ -f "${ROOT_DIR}/docker-compose.yml.backup.phase6" ]; then
        rollback_phase 6 "ai"
    fi
    
    # Phase 5: Workflow Domain
    if [ -d "${ROOT_DIR}/modules/workflow" ] || [ -f "${ROOT_DIR}/docker-compose.yml.backup.phase5" ]; then
        rollback_phase 5 "workflow"
    fi
    
    # Phase 4: Productivity Domain
    if [ -d "${ROOT_DIR}/modules/productivity" ] || [ -f "${ROOT_DIR}/docker-compose.yml.backup.phase4" ]; then
        rollback_phase 4 "productivity"
    fi
    
    # Phase 3: TCG Domain
    if [ -d "${ROOT_DIR}/modules/tcg" ] || [ -f "${ROOT_DIR}/docker-compose.yml.backup.phase3" ]; then
        rollback_phase 3 "tcg"
    fi
    
    # Phase 2: Security Domain
    if [ -d "${ROOT_DIR}/modules/security" ] || [ -f "${ROOT_DIR}/docker-compose.yml.backup.phase2" ]; then
        rollback_phase 2 "security"
    fi
    
    # Phase 1: Domain Structure
    if [ -d "${ROOT_DIR}/modules" ] || [ -d "${ROOT_DIR}/libs" ]; then
        rollback_phase1
    fi
    
    print_header "Rollback Complete"
    
    print_status "${GREEN}" "All migration phases have been rolled back."
    print_status "${YELLOW}" ""
    print_status "${YELLOW}" "Next steps:"
    print_status "${YELLOW}" "  1. Restore moved files using git:"
    print_status "${YELLOW}" "     git restore features/"
    print_status "${YELLOW}" "     git restore apps/"
    print_status "${YELLOW}" "  2. Or checkout from backup branch:"
    print_status "${YELLOW}" "     git checkout backup/pre-migration"
    print_status "${YELLOW}" "  3. Clean up backup files if desired:"
    print_status "${YELLOW}" "     rm docker-compose.*.backup.phase*"
    
    echo ""
}

# Run main function
main "$@"
