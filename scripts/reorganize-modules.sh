#!/bin/bash
# Module Reorganization Script
# Reorganizes modules directory to follow DDD structure similar to nemesis project
# Structure: modules/<domain>/{libs,projects,infra,docs,tools}
# Also extracts infrastructure from projects into organized infra/ subdirectories

set -e

WORKSPACE_ROOT="/workspaces/expert-dollop"
MODULES_DIR="$WORKSPACE_ROOT/modules"

# Parse arguments
DRY_RUN=false
EXTRACT_INFRA=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --extract-infra|-e)
            EXTRACT_INFRA=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
    if [ "$EXTRACT_INFRA" = true ]; then
        echo -e "${YELLOW}Infrastructure Extraction: ENABLED${NC}"
    fi
    echo -e "${YELLOW}========================================${NC}"
else
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Module Reorganization (DDD Structure)${NC}"
    if [ "$EXTRACT_INFRA" = true ]; then
        echo -e "${BLUE}Infrastructure Extraction: ENABLED${NC}"
    fi
    echo -e "${BLUE}========================================${NC}"
fi
echo ""

# Domain list
DOMAINS=("ai" "security" "productivity" "tcg" "workflow")

# Function to extract infrastructure from a project
extract_project_infrastructure() {
    local project_path=$1
    local project_name=$2
    local domain_infra_dir=$3
    
    if [ ! -d "$project_path" ]; then
        return
    fi
    
    local found_infra=false
    
    # Create project-specific infra directory
    local project_infra="$domain_infra_dir/$project_name"
    
    # Extract Docker files
    if [ -f "$project_path/Dockerfile" ] || [ -f "$project_path/docker-compose.yml" ] || [ -f "$project_path/docker-compose.yaml" ]; then
        found_infra=true
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$project_infra/docker"
            [ -f "$project_path/Dockerfile" ] && cp "$project_path/Dockerfile" "$project_infra/docker/"
            [ -f "$project_path/docker-compose.yml" ] && cp "$project_path/docker-compose.yml" "$project_infra/docker/"
            [ -f "$project_path/docker-compose.yaml" ] && cp "$project_path/docker-compose.yaml" "$project_infra/docker/"
            [ -f "$project_path/.dockerignore" ] && cp "$project_path/.dockerignore" "$project_infra/docker/"
            echo -e "      ${GREEN}↗${NC} Extracted Docker files to infra/$project_name/docker/"
        else
            echo -e "      ${YELLOW}↗${NC} Would extract Docker files to infra/$project_name/docker/"
        fi
    fi
    
    # Extract docker subdirectory
    if [ -d "$project_path/docker" ]; then
        found_infra=true
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$project_infra/docker"
            cp -r "$project_path/docker/"* "$project_infra/docker/" 2>/dev/null || true
            echo -e "      ${GREEN}↗${NC} Extracted docker/ directory to infra/$project_name/docker/"
        else
            echo -e "      ${YELLOW}↗${NC} Would extract docker/ directory to infra/$project_name/docker/"
        fi
    fi
    
    # Extract deploy directory
    if [ -d "$project_path/deploy" ]; then
        found_infra=true
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$project_infra/deploy"
            cp -r "$project_path/deploy/"* "$project_infra/deploy/" 2>/dev/null || true
            echo -e "      ${GREEN}↗${NC} Extracted deploy/ directory to infra/$project_name/deploy/"
        else
            echo -e "      ${YELLOW}↗${NC} Would extract deploy/ directory to infra/$project_name/deploy/"
        fi
    fi
    
    # Extract Kubernetes/Helm files
    if [ -d "$project_path/kubernetes" ] || [ -d "$project_path/k8s" ] || [ -d "$project_path/helm" ]; then
        found_infra=true
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$project_infra/kubernetes"
            [ -d "$project_path/kubernetes" ] && cp -r "$project_path/kubernetes/"* "$project_infra/kubernetes/" 2>/dev/null || true
            [ -d "$project_path/k8s" ] && cp -r "$project_path/k8s/"* "$project_infra/kubernetes/" 2>/dev/null || true
            [ -d "$project_path/helm" ] && cp -r "$project_path/helm/"* "$project_infra/kubernetes/" 2>/dev/null || true
            echo -e "      ${GREEN}↗${NC} Extracted Kubernetes files to infra/$project_name/kubernetes/"
        else
            echo -e "      ${YELLOW}↗${NC} Would extract Kubernetes files to infra/$project_name/kubernetes/"
        fi
    fi
    
    # Extract config directory (be selective)
    if [ -d "$project_path/config" ] || [ -d "$project_path/configs" ]; then
        found_infra=true
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$project_infra/config"
            [ -d "$project_path/config" ] && cp -r "$project_path/config/"* "$project_infra/config/" 2>/dev/null || true
            [ -d "$project_path/configs" ] && cp -r "$project_path/configs/"* "$project_infra/config/" 2>/dev/null || true
            echo -e "      ${GREEN}↗${NC} Extracted config/ directory to infra/$project_name/config/"
        else
            echo -e "      ${YELLOW}↗${NC} Would extract config/ directory to infra/$project_name/config/"
        fi
    fi
    
    # Extract .devcontainer
    if [ -d "$project_path/.devcontainer" ]; then
        found_infra=true
        if [ "$DRY_RUN" = false ]; then
            mkdir -p "$project_infra/devcontainer"
            cp -r "$project_path/.devcontainer/"* "$project_infra/devcontainer/" 2>/dev/null || true
            echo -e "      ${GREEN}↗${NC} Extracted .devcontainer/ to infra/$project_name/devcontainer/"
        else
            echo -e "      ${YELLOW}↗${NC} Would extract .devcontainer/ to infra/$project_name/devcontainer/"
        fi
    fi
    
    if [ "$found_infra" = false ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "      ${BLUE}ℹ${NC} No infrastructure found in $project_name"
        fi
    fi
}

# Create backup (skip in dry-run)
if [ "$DRY_RUN" = false ]; then
    BACKUP_DIR="$WORKSPACE_ROOT/modules_backup_$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}Creating backup at: $BACKUP_DIR${NC}"
    cp -r "$MODULES_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}✓ Backup created${NC}"
    echo ""
else
    echo -e "${YELLOW}[DRY-RUN] Would create backup${NC}"
    echo ""
fi

for domain in "${DOMAINS[@]}"; do
    echo -e "${BLUE}Processing domain: $domain${NC}"
    
    DOMAIN_DIR="$MODULES_DIR/$domain"
    
    if [ ! -d "$DOMAIN_DIR" ]; then
        echo -e "${YELLOW}  ⚠ Domain directory not found, skipping${NC}"
        continue
    fi
    
    # Create DDD structure
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$DOMAIN_DIR/libs"
        mkdir -p "$DOMAIN_DIR/projects"
        mkdir -p "$DOMAIN_DIR/infra"
        mkdir -p "$DOMAIN_DIR/docs"
        mkdir -p "$DOMAIN_DIR/tools"
        echo -e "${GREEN}  ✓ Created DDD structure${NC}"
    else
        echo -e "${YELLOW}  [DRY-RUN] Would create: libs/, projects/, infra/, docs/, tools/${NC}"
    fi
    
    # Move existing items based on classification
    cd "$DOMAIN_DIR"
    
    # Move existing projects to projects/
    for item in */; do
        item_name="${item%/}"
        
        # Skip if already in target directories
        if [[ "$item_name" == "libs" || "$item_name" == "projects" || \
              "$item_name" == "infra" || "$item_name" == "docs" || \
              "$item_name" == "tools" ]]; then
            continue
        fi
        
        # Classify based on patterns
        if [[ "$item_name" == *"-lib"* || "$item_name" == *"-shared"* || \
              "$item_name" == "common" || "$item_name" == "analytics" || \
              "$item_name" == *"-mcp" || "$item_name" == "chroma-mcp" || \
              "$item_name" == "filescope-mcp" ]]; then
            if [ "$DRY_RUN" = false ]; then
                echo -e "    ${GREEN}→${NC} Moving $item_name to libs/"
                mv "$item_name" "libs/"
            else
                echo -e "    ${YELLOW}→${NC} Would move $item_name to libs/"
            fi
        elif [[ "$item_name" == "infrastructure" || "$item_name" == *"-infra"* || \
                "$item_name" == *"postgres"* || "$item_name" == *"playwright-service"* ]]; then
            if [ "$DRY_RUN" = false ]; then
                echo -e "    ${GREEN}→${NC} Moving $item_name to infra/"
                mv "$item_name" "infra/"
            else
                echo -e "    ${YELLOW}→${NC} Would move $item_name to infra/"
            fi
        else
            # Default to projects
            if [ "$DRY_RUN" = false ]; then
                echo -e "    ${GREEN}→${NC} Moving $item_name to projects/"
                mv "$item_name" "projects/"
            else
                echo -e "    ${YELLOW}→${NC} Would move $item_name to projects/"
            fi
        fi
    done
    
    # Move standalone files to appropriate locations
    if [ -f "README.md" ]; then
        echo -e "    ${BLUE}ℹ${NC} Preserving README.md at domain root"
    fi
    
    if [ -f "MIGRATION.md" ]; then
        if [ "$DRY_RUN" = false ]; then
            mv "MIGRATION.md" "docs/" 2>/dev/null || true
            echo -e "    ${GREEN}→${NC} Moved MIGRATION.md to docs/"
        else
            echo -e "    ${YELLOW}→${NC} Would move MIGRATION.md to docs/"
        fi
    fi
    
    # Move docker-compose files
    for compose_file in docker-compose*.yml docker-compose*.yaml; do
        if [ -f "$compose_file" ]; then
            if [ "$DRY_RUN" = false ]; then
                mv "$compose_file" "infra/" 2>/dev/null || true
                echo -e "    ${GREEN}→${NC} Moved $compose_file to infra/"
            else
                echo -e "    ${YELLOW}→${NC} Would move $compose_file to infra/"
            fi
        fi
    done
    
    # Move backup files to docs
    for bak_file in *.bak *.backup*; do
        if [ -f "$bak_file" ]; then
            if [ "$DRY_RUN" = false ]; then
                mv "$bak_file" "docs/" 2>/dev/null || true
                echo -e "    ${GREEN}→${NC} Moved $bak_file to docs/"
            else
                echo -e "    ${YELLOW}→${NC} Would move $bak_file to docs/"
            fi
        fi
    done
    
    # Create domain-level README if it doesn't exist
    if [ ! -f "README.md" ]; then
        if [ "$DRY_RUN" = false ]; then
            cat > "README.md" << EOF
# ${domain^} Domain

Domain-driven design organization for ${domain} functionality.

## Structure

- **libs/** - Shared libraries and common code for this domain
- **projects/** - Individual services and applications
- **infra/** - Infrastructure configuration (Docker, K8s, etc.)
- **docs/** - Domain-specific documentation
- **tools/** - Domain-specific utilities and scripts

## Getting Started

See individual project READMEs for specific setup instructions.
EOF
            echo -e "${GREEN}  ✓ Created domain README${NC}"
        else
            echo -e "${YELLOW}  [DRY-RUN] Would create domain README${NC}"
        fi
    fi
    
    # Extract infrastructure from projects if enabled
    if [ "$EXTRACT_INFRA" = true ]; then
        echo -e "${BLUE}  Extracting infrastructure from projects...${NC}"
        
        # Process projects directory
        if [ -d "projects" ]; then
            for project in projects/*/; do
                if [ -d "$project" ]; then
                    project_name=$(basename "$project")
                    extract_project_infrastructure "$project" "$project_name" "$DOMAIN_DIR/infra"
                fi
            done
        fi
        
        # Also check items that haven't been moved yet (in dry-run)
        if [ "$DRY_RUN" = true ]; then
            for item in */; do
                item_name="${item%/}"
                # Skip target directories
                if [[ "$item_name" != "libs" && "$item_name" != "projects" && \
                      "$item_name" != "infra" && "$item_name" != "docs" && \
                      "$item_name" != "tools" ]]; then
                    # Check if it would go to projects
                    if [[ "$item_name" != *"-lib"* && "$item_name" != *"-shared"* && \
                          "$item_name" != "common" && "$item_name" != "analytics" && \
                          "$item_name" != *"-mcp" && "$item_name" != "infrastructure" && \
                          "$item_name" != *"-infra"* && "$item_name" != *"postgres"* && \
                          "$item_name" != *"playwright-service"* ]]; then
                        extract_project_infrastructure "$item_name" "$item_name" "$DOMAIN_DIR/infra"
                    fi
                fi
            done
        fi
    fi
    
    echo ""
done

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Dry Run Complete - No Changes Made${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo "To execute the reorganization, run:"
    echo "  ./scripts/reorganize-modules.sh"
    echo ""
    echo "To also extract infrastructure from projects:"
    echo "  ./scripts/reorganize-modules.sh --extract-infra"
    echo ""
    echo "For dry-run with infrastructure extraction:"
    echo "  ./scripts/reorganize-modules.sh --dry-run --extract-infra"
else
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Reorganization Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Backup location: $BACKUP_DIR"
    echo ""
    echo "Next steps:"
    echo "1. Review the reorganized structure"
    echo "2. Update import paths in code if needed"
    echo "3. Update documentation references"
    echo "4. Test that everything still works"
    echo "5. Remove backup once confirmed: rm -rf $BACKUP_DIR"
fi
