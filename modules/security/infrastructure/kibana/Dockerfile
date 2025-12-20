FROM docker.elastic.co/kibana/kibana:8.11.1

# Set working directory
WORKDIR /usr/share/kibana

# Copy configuration
COPY config/kibana.yml /usr/share/kibana/config/

# Copy dashboards
COPY dashboards /usr/share/kibana/dashboards

# Install any additional plugins if needed
# RUN bin/kibana-plugin install <plugin-name>

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5601/api/status || exit 1

# Expose Kibana port
EXPOSE 5601

# Run as kibana user
USER kibana

# Start Kibana
CMD ["bin/kibana"]
