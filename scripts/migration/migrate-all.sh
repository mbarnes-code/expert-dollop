#!/bin/bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════════════════════
# Master Migration Script
# ════════════════════════════════════════════════════════════════════════════════
# Orchestrates the entire migration from current structure to domain-based modules
# Runs phases 1-6 in sequence with proper error handling
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

# Function to run a migration phase
run_phase() {
    local phase_num=$1
    local phase_script=$2
    local phase_name=$3
    
    print_header "Phase ${phase_num}: ${phase_name}"
    
    if [ ! -f "${SCRIPT_DIR}/${phase_script}" ]; then
        print_status "${RED}" "Error: ${phase_script} not found!"
        return 1
    fi
    
    # Make script executable
    chmod +x "${SCRIPT_DIR}/${phase_script}"
    
    # Run the phase script
    if bash "${SCRIPT_DIR}/${phase_script}"; then
        print_status "${GREEN}" "✓ Phase ${phase_num} completed successfully"
        return 0
    else
        print_status "${RED}" "✗ Phase ${phase_num} failed!"
        return 1
    fi
}

# Main migration orchestration
main() {
    print_header "Domain-Based Migration - Phases 1-6"
    
    print_status "${YELLOW}" "This script will migrate your codebase to a domain-based modular monolith structure."
    print_status "${YELLOW}" "It will run all 6 migration phases in sequence."
    print_status "${YELLOW}" ""
    print_status "${YELLOW}" "Before proceeding, ensure you have:"
    print_status "${YELLOW}" "  1. Committed all current changes to git"
    print_status "${YELLOW}" "  2. Created a backup branch: git checkout -b backup/pre-migration"
    print_status "${YELLOW}" "  3. Returned to your working branch: git checkout main"
    print_status "${YELLOW}" ""
    
    read -p "Do you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy](es)?$ ]]; then
        print_status "${YELLOW}" "Migration cancelled."
        exit 0
    fi
    
    cd "${ROOT_DIR}"
    
    # Create migration log file
    MIGRATION_LOG="${ROOT_DIR}/migration-$(date +%Y%m%d-%H%M%S).log"
    print_status "${BLUE}" "Logging to: ${MIGRATION_LOG}"
    
    # Track which phases completed
    COMPLETED_PHASES=()
    
    # Phase 1: Create Domain Structure
    if run_phase 1 "phase1-create-domain-structure.sh" "Create Domain Structure" 2>&1 | tee -a "${MIGRATION_LOG}"; then
        COMPLETED_PHASES+=("Phase 1")
    else
        print_status "${RED}" "Migration failed at Phase 1. Check ${MIGRATION_LOG} for details."
        exit 1
    fi
    
    # Phase 2: Move Security Domain
    if run_phase 2 "phase2-move-security-domain.sh" "Move Security Domain" 2>&1 | tee -a "${MIGRATION_LOG}"; then
        COMPLETED_PHASES+=("Phase 2")
    else
        print_status "${RED}" "Migration failed at Phase 2. Check ${MIGRATION_LOG} for details."
        print_status "${YELLOW}" "You can rollback Phase 1 if needed."
        exit 1
    fi
    
    # Phase 3: Move TCG Domain
    if run_phase 3 "phase3-move-tcg-domain.sh" "Move TCG Domain" 2>&1 | tee -a "${MIGRATION_LOG}"; then
        COMPLETED_PHASES+=("Phase 3")
    else
        print_status "${RED}" "Migration failed at Phase 3. Check ${MIGRATION_LOG} for details."
        print_status "${YELLOW}" "You can rollback Phases 1-2 if needed."
        exit 1
    fi
    
    # Phase 4: Move Productivity Domain
    if run_phase 4 "phase4-move-productivity-domain.sh" "Move Productivity Domain" 2>&1 | tee -a "${MIGRATION_LOG}"; then
        COMPLETED_PHASES+=("Phase 4")
    else
        print_status "${RED}" "Migration failed at Phase 4. Check ${MIGRATION_LOG} for details."
        print_status "${YELLOW}" "You can rollback Phases 1-3 if needed."
        exit 1
    fi
    
    # Phase 5: Move Workflow Domain
    if run_phase 5 "phase5-move-workflow-domain.sh" "Move Workflow Domain" 2>&1 | tee -a "${MIGRATION_LOG}"; then
        COMPLETED_PHASES+=("Phase 5")
    else
        print_status "${RED}" "Migration failed at Phase 5. Check ${MIGRATION_LOG} for details."
        print_status "${YELLOW}" "You can rollback Phases 1-4 if needed."
        exit 1
    fi
    
    # Phase 6: Move AI Domain
    if run_phase 6 "phase6-move-ai-domain.sh" "Move AI Domain" 2>&1 | tee -a "${MIGRATION_LOG}"; then
        COMPLETED_PHASES+=("Phase 6")
    else
        print_status "${RED}" "Migration failed at Phase 6. Check ${MIGRATION_LOG} for details."
        print_status "${YELLOW}" "You can rollback Phases 1-5 if needed."
        exit 1
    fi
    
    # All phases completed successfully
    print_header "Migration Complete! 🎉"
    
    print_status "${GREEN}" "All 6 migration phases completed successfully!"
    print_status "${GREEN}" ""
    print_status "${GREEN}" "Completed phases:"
    for phase in "${COMPLETED_PHASES[@]}"; do
        print_status "${GREEN}" "  ✓ ${phase}"
    done
    
    echo ""
    print_status "${BLUE}" "Migration summary:"
    print_status "${BLUE}" "  - Created: modules/{security,tcg,productivity,workflow,ai}/"
    print_status "${BLUE}" "  - Created: libs/{typescript,python,rust,go}/"
    print_status "${BLUE}" "  - Migrated all domain modules"
    print_status "${BLUE}" "  - Updated docker-compose files"
    print_status "${BLUE}" "  - Created backups with .backup.phaseN extensions"
    
    echo ""
    print_status "${YELLOW}" "Next steps:"
    print_status "${YELLOW}" "  1. Review the changes: git status"
    print_status "${YELLOW}" "  2. Test each domain's docker-compose file:"
    print_status "${YELLOW}" "     - docker-compose -f docker-compose.security.yml build"
    print_status "${YELLOW}" "     - docker-compose -f docker-compose.tcg.yml build"
    print_status "${YELLOW}" "     - docker-compose -f docker-compose.productivity.yml build"
    print_status "${YELLOW}" "     - docker-compose -f docker-compose.workflow.yml build"
    print_status "${YELLOW}" "     - docker-compose -f docker-compose.ai.yml build"
    print_status "${YELLOW}" "  3. Update CI/CD pipelines (.github/workflows/)"
    print_status "${YELLOW}" "  4. Update infrastructure/ references"
    print_status "${YELLOW}" "  5. Commit the migration: git add -A && git commit -m 'Migrate to domain-based modules'"
    
    echo ""
    print_status "${BLUE}" "Full migration log saved to: ${MIGRATION_LOG}"
    
    echo ""
}

# Run main function
main "$@"
