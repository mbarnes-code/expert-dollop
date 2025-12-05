#!/bin/bash
# HELK + SecurityOnion Setup Script
# First-time installation and configuration

set -e

echo "==================================="
echo "HELK + SecurityOnion Setup"
echo "==================================="
echo ""

# Check prerequisites
echo "[1/6] Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"

# Create necessary directories
echo "[2/6] Creating directories..."
mkdir -p certs
mkdir -p config/elasticsearch
mkdir -p config/kibana
mkdir -p config/logstash
mkdir -p config/jupyter
mkdir -p templates
echo "✓ Directories created"

# Generate self-signed certificates for Elasticsearch SSL
echo "[3/6] Generating SSL certificates..."
if [ ! -f certs/ca.key ]; then
    # Generate CA
    openssl req -x509 -newkey rsa:4096 -keyout certs/ca.key -out certs/ca.crt -days 365 -nodes \
        -subj "/CN=HELK-CA/O=Security Platform/C=US"
    
    # Generate Elasticsearch certificate
    openssl req -newkey rsa:4096 -keyout certs/elasticsearch.key -out certs/elasticsearch.csr -nodes \
        -subj "/CN=elasticsearch/O=Security Platform/C=US"
    
    openssl x509 -req -in certs/elasticsearch.csr -CA certs/ca.crt -CAkey certs/ca.key \
        -CAcreateserial -out certs/elasticsearch.crt -days 365
    
    # Set permissions
    chmod 644 certs/*.crt
    chmod 600 certs/*.key
    
    echo "✓ SSL certificates generated"
else
    echo "✓ SSL certificates already exist"
fi

# Copy configuration files
echo "[4/6] Setting up configuration files..."
if [ ! -f config/elasticsearch/elasticsearch.yml ]; then
    cp src/config/elasticsearch/elasticsearch.yml config/elasticsearch/
fi
if [ ! -f config/kibana/kibana.yml ]; then
    cp src/config/kibana/kibana.yml config/kibana/
fi
if [ ! -f config/logstash/logstash.yml ]; then
    cp src/config/logstash/logstash.yml config/logstash/
fi
if [ ! -f config/logstash/pipelines.yml ]; then
    cp config/logstash/pipelines.yml config/logstash/
fi
echo "✓ Configuration files set up"

# Set system parameters for Elasticsearch
echo "[5/6] Setting system parameters..."
echo "Setting vm.max_map_count (requires sudo)..."
if [ "$(id -u)" -eq 0 ]; then
    sysctl -w vm.max_map_count=262144
    echo "vm.max_map_count=262144" >> /etc/sysctl.conf
elif command -v sudo &> /dev/null; then
    sudo sysctl -w vm.max_map_count=262144
    echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
else
    echo "Warning: Cannot set vm.max_map_count (no root/sudo access)"
    echo "Please run: sudo sysctl -w vm.max_map_count=262144"
fi
echo "✓ System parameters configured"

# Pull Docker images
echo "[6/6] Pulling Docker images (this may take a while)..."
docker-compose pull
echo "✓ Docker images pulled"

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Review and customize configuration in config/ directory"
echo "2. Update passwords in docker-compose.yml (search for 'changeme')"
echo "3. Start services: docker-compose up -d"
echo "4. Access Kibana at: http://localhost:5601"
echo "5. Access Jupyter at: http://localhost:8888"
echo "6. Access Spark UI at: http://localhost:8080"
echo ""
echo "For more information, see DEPLOYMENT.md"
