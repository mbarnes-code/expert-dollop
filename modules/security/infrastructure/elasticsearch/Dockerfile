FROM docker.elastic.co/elasticsearch/elasticsearch:8.11.1

# Install required plugins
RUN elasticsearch-plugin install --batch analysis-icu
RUN elasticsearch-plugin install --batch analysis-phonetic

# Create necessary directories
RUN mkdir -p /usr/share/elasticsearch/config/index-templates
RUN mkdir -p /usr/share/elasticsearch/data

# Copy custom configuration
COPY config/elasticsearch.yml /usr/share/elasticsearch/config/
COPY config/jvm.options /usr/share/elasticsearch/config/

# Copy index templates
COPY index-templates/*.json /usr/share/elasticsearch/config/index-templates/

# Set permissions
RUN chown -R elasticsearch:elasticsearch /usr/share/elasticsearch

# Expose ports
EXPOSE 9200 9300

USER elasticsearch

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:9200/_cluster/health || exit 1
