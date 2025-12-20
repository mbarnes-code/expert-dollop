# Java/Maven Infrastructure

Shared Java development infrastructure and Maven build configuration for security domain projects.

## Projects Using Java/Maven

### Software Forensic Kit
- **Path**: `modules/security/software-forensic-kit`
- **Group ID**: `com.omnissa.software_forensic_kit`
- **Artifact ID**: `software_forensic_kit`
- **Version**: 0.0.1-SNAPSHOT
- **Java Version**: 1.8
- **Purpose**: Software forensics and analysis toolkit
- **Key Dependencies**:
  - JSch (SSH client)
  - Apache Commons (CLI, IO)
  - GSON (JSON processing)
  - Apache BCEL (bytecode manipulation)
  - ASM (bytecode analysis)

## Common Configuration Files

### pom.xml (Parent)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.security</groupId>
    <artifactId>security-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <junit.version>5.10.1</junit.version>
        <slf4j.version>2.0.9</slf4j.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Logging -->
            <dependency>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-api</artifactId>
                <version>${slf4j.version}</version>
            </dependency>
            
            <!-- Testing -->
            <dependency>
                <groupId>org.junit.jupiter</groupId>
                <artifactId>junit-jupiter</artifactId>
                <version>${junit.version}</version>
                <scope>test</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.11.0</version>
                </plugin>
                
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                    <version>3.2.2</version>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
```

### pom.xml (Application)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.security.forensics</groupId>
    <artifactId>forensic-toolkit</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Apache Commons -->
        <dependency>
            <groupId>commons-cli</groupId>
            <artifactId>commons-cli</artifactId>
            <version>1.6.0</version>
        </dependency>
        
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.15.1</version>
        </dependency>
        
        <!-- JSON Processing -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
        
        <!-- Bytecode Analysis -->
        <dependency>
            <groupId>org.apache.bcel</groupId>
            <artifactId>bcel</artifactId>
            <version>6.8.1</version>
        </dependency>
        
        <dependency>
            <groupId>org.ow2.asm</groupId>
            <artifactId>asm</artifactId>
            <version>9.6</version>
        </dependency>
        
        <!-- SSH -->
        <dependency>
            <groupId>com.jcraft</groupId>
            <artifactId>jsch</artifactId>
            <version>0.1.55</version>
        </dependency>
        
        <!-- Logging -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.9</version>
        </dependency>
        
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>1.4.14</version>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <version>5.8.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Compiler -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <release>17</release>
                </configuration>
            </plugin>
            
            <!-- Testing -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.2</version>
            </plugin>
            
            <!-- JAR with dependencies -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.6.0</version>
                <configuration>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                    <archive>
                        <manifest>
                            <mainClass>com.security.forensics.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
                <executions>
                    <execution>
                        <id>make-assembly</id>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## Dockerfile

```dockerfile
# Multi-stage build for Java applications
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Create app user
RUN addgroup -g 1001 -S javauser && \
    adduser -S javauser -u 1001

WORKDIR /app

# Copy JAR from builder
COPY --from=builder /app/target/*.jar app.jar

RUN chown -R javauser:javauser /app

USER javauser

# JVM options
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"

EXPOSE 8080

ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
```

## Build Scripts

### build.sh
```bash
#!/bin/bash
set -euo pipefail

echo "Building Java application..."

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package
mvn package

echo "Build complete: target/*.jar"
```

### run-tests.sh
```bash
#!/bin/bash
set -euo pipefail

# Run unit tests
mvn test

# Run integration tests
mvn verify -P integration-tests

# Generate test coverage report
mvn jacoco:report

echo "Test results: target/surefire-reports/"
echo "Coverage report: target/site/jacoco/index.html"
```

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── security/
│   │           └── forensics/
│   │               ├── Main.java
│   │               ├── core/
│   │               ├── analyzers/
│   │               ├── collectors/
│   │               ├── exporters/
│   │               └── utils/
│   └── resources/
│       ├── application.properties
│       ├── logback.xml
│       └── config/
└── test/
    ├── java/
    │   └── com/
    │       └── security/
    │           └── forensics/
    │               └── AnalyzerTest.java
    └── resources/
        └── test-data/
```

## Configuration Files

### logback.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/application.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="STDOUT" />
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

### application.properties
```properties
# Application
app.name=Forensic Toolkit
app.version=1.0.0

# Logging
logging.level.com.security=DEBUG
logging.level.org.springframework=INFO

# Thread Pool
thread.pool.size=10
thread.pool.queue.capacity=100

# Timeouts
connection.timeout=30000
read.timeout=60000
```

## Testing

### JUnit 5 Example
```java
package com.security.forensics;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class AnalyzerTest {
    
    private Analyzer analyzer;
    
    @BeforeEach
    void setUp() {
        analyzer = new Analyzer();
    }
    
    @Test
    @DisplayName("Should analyze bytecode correctly")
    void testBytecodeAnalysis() {
        byte[] bytecode = loadTestBytecode();
        AnalysisResult result = analyzer.analyze(bytecode);
        
        assertNotNull(result);
        assertTrue(result.isValid());
        assertEquals(5, result.getMethodCount());
    }
    
    @Test
    void testInvalidInput() {
        assertThrows(IllegalArgumentException.class, () -> {
            analyzer.analyze(null);
        });
    }
}
```

## Maven Plugins

### Code Coverage (JaCoCo)
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### Static Analysis (SpotBugs)
```xml
<plugin>
    <groupId>com.github.spotbugs</groupId>
    <artifactId>spotbugs-maven-plugin</artifactId>
    <version>4.8.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### Code Formatting (Spotless)
```xml
<plugin>
    <groupId>com.diffplug.spotless</groupId>
    <artifactId>spotless-maven-plugin</artifactId>
    <version>2.41.0</version>
    <configuration>
        <java>
            <googleJavaFormat>
                <version>1.17.0</version>
            </googleJavaFormat>
        </java>
    </configuration>
</plugin>
```

## Security

### Dependency Vulnerability Scanning
```bash
# OWASP Dependency Check
mvn org.owasp:dependency-check-maven:check

# Snyk
mvn snyk:test

# Update dependencies
mvn versions:display-dependency-updates
```

### Security Best Practices
- Keep dependencies updated
- Use OWASP Dependency Check
- Validate all inputs
- Avoid serialization of untrusted data
- Use prepared statements for SQL
- Implement proper authentication/authorization
- Log security events

## Performance Tuning

### JVM Options
```bash
# Heap size
-Xms512m -Xmx2g

# Garbage Collection
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# GC Logging
-Xlog:gc*:file=gc.log:time,uptime:filecount=10,filesize=100m

# Remote debugging
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
```

## CI/CD

### GitHub Actions
```yaml
name: Java CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'maven'
      
      - name: Build with Maven
        run: mvn clean verify
      
      - name: Run tests
        run: mvn test
      
      - name: Generate coverage report
        run: mvn jacoco:report
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Resources

- Maven Documentation: https://maven.apache.org/guides
- JUnit 5: https://junit.org/junit5/docs/current/user-guide
- Apache Commons: https://commons.apache.org
- Software Forensic Kit: See `modules/security/software-forensic-kit/` for reference
