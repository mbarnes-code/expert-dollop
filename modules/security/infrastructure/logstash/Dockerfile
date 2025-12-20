FROM docker.elastic.co/logstash/logstash:8.11.1

# Set working directory
WORKDIR /usr/share/logstash

# Copy configuration files
COPY config/logstash.yml /usr/share/logstash/config/
COPY config/pipelines.yml /usr/share/logstash/config/

# Copy pipeline configurations
COPY pipelines /usr/share/logstash/pipelines

# Install additional plugins if needed
# RUN bin/logstash-plugin install logstash-input-<plugin>

# Create data and logs directories
RUN mkdir -p /usr/share/logstash/data /usr/share/logstash/logs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:9600/_node/stats || exit 1

# Expose ports
# 5044: Beats input
# 5000: TCP input
# 9600: Logstash monitoring API
EXPOSE 5044 5000 9600

# Run as logstash user
USER logstash

# Start Logstash
CMD ["bin/logstash"]
