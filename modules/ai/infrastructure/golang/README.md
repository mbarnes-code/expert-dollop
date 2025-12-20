# Go Infrastructure

This directory contains infrastructure documentation and common configuration patterns for Go projects in the AI module.

## Projects Using This Stack

### 1. **html-to-md-service** (`/modules/ai/html-to-md-service`)
- **Framework**: Standard library + Gorilla Mux
- **Go Version**: 1.23.0
- **Purpose**: HTML to Markdown conversion service
- **Common Files**:
  - `go.mod` - Module definition and dependencies
  - `go.sum` - Dependency checksums
  - `Dockerfile` - Container build
  - `docker-compose.yml` - Service orchestration
  - `Makefile` - Build automation
  - `requests.http` - API testing

### Project Structure
```
html-to-md-service/
├── main.go              # Application entry point
├── handler.go           # HTTP handlers
├── handler_test.go      # Handler tests
├── converter.go         # Conversion logic
├── go.mod              # Go module
├── go.sum              # Checksums
├── Dockerfile          # Docker build
├── docker-compose.yml  # Service config
├── Makefile           # Build commands
└── requests.http      # HTTP testing
```

## Common Configuration Files

### go.mod
Go module definition:
```go
module github.com/firecrawl/go-html-to-md-service

go 1.23.0

require (
    github.com/PuerkitoBio/goquery v1.10.3
    github.com/firecrawl/html-to-markdown v0.0.0-20250922154302-32a7ad4a22c3
    github.com/gorilla/mux v1.8.1
    github.com/rs/zerolog v1.33.0
    golang.org/x/net v0.41.0
)

require (
    github.com/andybalholm/cascadia v1.3.3 // indirect
    github.com/mattn/go-colorable v0.1.13 // indirect
    github.com/mattn/go-isatty v0.0.20 // indirect
    golang.org/x/sys v0.33.0 // indirect
)

replace github.com/JohannesKaufmann/html-to-markdown => github.com/firecrawl/html-to-markdown v0.0.0-20250917145228-b6d0a75dfdba
```

### Dockerfile
Multi-stage build for Go:
```dockerfile
# Build stage
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Runtime stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```

### Makefile
Build automation:
```makefile
.PHONY: build run test clean docker-build docker-run

build:
	go build -o bin/server .

run:
	go run .

test:
	go test -v ./...

clean:
	rm -rf bin/

docker-build:
	docker build -t html-to-md-service .

docker-run:
	docker run -p 8080:8080 html-to-md-service

lint:
	golangci-lint run

format:
	go fmt ./...
```

### docker-compose.yml
Service orchestration:
```yaml
version: '3.8'

services:
  html-to-md:
    build: .
    ports:
      - "8080:8080"
    environment:
      - LOG_LEVEL=info
      - PORT=8080
    restart: unless-stopped
```

## Common Go Frameworks & Libraries

### Web Frameworks
- **Gorilla Mux** (`github.com/gorilla/mux`) - HTTP router and dispatcher
  - Powerful URL routing
  - Middleware support
  - Pattern matching

### HTML/DOM Processing
- **goquery** (`github.com/PuerkitoBio/goquery`) - jQuery-like DOM manipulation
- **cascadia** (`github.com/andybalholm/cascadia`) - CSS selector library
- **html-to-markdown** - Custom HTML to Markdown converter

### Logging
- **zerolog** (`github.com/rs/zerolog`) - Structured logging
  - Zero allocation
  - JSON output
  - Fast performance

### HTTP Client
- **golang.org/x/net** - Extended network libraries

## Project Structure Patterns

### Standard Layout
```
project/
├── cmd/                 # Command-line applications
│   └── server/
│       └── main.go
├── internal/           # Private application code
│   ├── handler/       # HTTP handlers
│   ├── service/       # Business logic
│   └── model/         # Data models
├── pkg/               # Public libraries
├── api/               # API definitions (OpenAPI, gRPC)
├── configs/           # Configuration files
├── scripts/           # Build and deploy scripts
├── test/              # Integration tests
├── go.mod
├── go.sum
├── Dockerfile
└── Makefile
```

### Simple Service Layout
```
service/
├── main.go           # Entry point
├── handler.go        # HTTP handlers
├── service.go        # Business logic
├── model.go          # Data structures
├── handler_test.go   # Tests
├── go.mod
└── Dockerfile
```

## Environment Variables

Common patterns:
```bash
# Server
PORT=8080
HOST=0.0.0.0
READ_TIMEOUT=15s
WRITE_TIMEOUT=15s

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# CORS
CORS_ALLOWED_ORIGINS=*
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE

# Timeouts
REQUEST_TIMEOUT=30s
SHUTDOWN_TIMEOUT=10s
```

## Testing

### Unit Tests
```go
package main

import (
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestHandler(t *testing.T) {
    req := httptest.NewRequest("GET", "/api/endpoint", nil)
    w := httptest.NewRecorder()
    
    handler(w, req)
    
    if w.Code != http.StatusOK {
        t.Errorf("Expected status 200, got %d", w.Code)
    }
}
```

### Table-Driven Tests
```go
func TestConverter(t *testing.T) {
    tests := []struct {
        name     string
        input    string
        expected string
    }{
        {"simple", "<p>test</p>", "test"},
        {"bold", "<strong>bold</strong>", "**bold**"},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := convert(tt.input)
            if result != tt.expected {
                t.Errorf("got %s, want %s", result, tt.expected)
            }
        })
    }
}
```

### Benchmark Tests
```go
func BenchmarkConverter(b *testing.B) {
    html := "<p>test</p>"
    for i := 0; i < b.N; i++ {
        convert(html)
    }
}
```

## Build Patterns

### Standard Build
```bash
go build -o bin/app .
```

### Optimized Build
```bash
CGO_ENABLED=0 GOOS=linux go build \
  -a \
  -installsuffix cgo \
  -ldflags="-w -s" \
  -o bin/app .
```

### Cross-Compilation
```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o bin/app-linux .

# Windows
GOOS=windows GOARCH=amd64 go build -o bin/app.exe .

# macOS
GOOS=darwin GOARCH=amd64 go build -o bin/app-mac .
```

## Dependency Management

### Download Dependencies
```bash
go mod download
```

### Update Dependencies
```bash
go get -u ./...
go mod tidy
```

### Vendor Dependencies
```bash
go mod vendor
```

### Replace Directive
For local or forked dependencies:
```go
replace github.com/original/pkg => github.com/fork/pkg v1.0.0
```

## Docker Build Optimization

### Multi-stage Build
- Build stage: Full Go toolchain
- Runtime stage: Minimal Alpine Linux
- Reduces final image size significantly

### Layer Caching
```dockerfile
# Copy go.mod first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Then copy source
COPY . .
```

## Health Checks

### HTTP Health Endpoint
```go
func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "healthy",
        "service": "html-to-md",
    })
}
```

### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
```

## Logging Patterns

### Structured Logging with zerolog
```go
import "github.com/rs/zerolog/log"

log.Info().
    Str("method", r.Method).
    Str("path", r.URL.Path).
    Int("status", 200).
    Msg("request handled")
```

### Context-aware Logging
```go
logger := log.With().
    Str("request_id", requestID).
    Logger()

logger.Info().Msg("processing request")
```

## Error Handling

### Custom Error Types
```go
type ServiceError struct {
    Code    int
    Message string
    Err     error
}

func (e *ServiceError) Error() string {
    return e.Message
}
```

### HTTP Error Response
```go
func writeError(w http.ResponseWriter, code int, message string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(map[string]string{
        "error": message,
    })
}
```

## Middleware Patterns

### Logging Middleware
```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Info().
            Str("method", r.Method).
            Str("path", r.URL.Path).
            Dur("duration", time.Since(start)).
            Msg("request completed")
    })
}
```

### CORS Middleware
```go
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
        next.ServeHTTP(w, r)
    })
}
```

## Best Practices

1. **Use Go Modules** - Modern dependency management
2. **Structure Logging** - Use zerolog or similar for structured logs
3. **Error Wrapping** - Use `fmt.Errorf("context: %w", err)` for error chains
4. **Context Propagation** - Pass `context.Context` for cancellation
5. **Table-Driven Tests** - More maintainable test cases
6. **Multi-stage Builds** - Smaller Docker images
7. **Graceful Shutdown** - Handle SIGTERM/SIGINT properly
8. **HTTP Timeouts** - Always set read/write timeouts
9. **Static Analysis** - Use `golangci-lint` for code quality
10. **Go Formatting** - Run `go fmt` before committing

## Code Quality Tools

### golangci-lint
```yaml
# .golangci.yml
run:
  timeout: 5m
linters:
  enable:
    - gofmt
    - golint
    - govet
    - errcheck
    - staticcheck
```

### go fmt
```bash
go fmt ./...
```

### go vet
```bash
go vet ./...
```

## CI/CD Patterns

### GitHub Actions
```yaml
name: Go CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.23'
      - run: go mod download
      - run: go test -v -race -coverprofile=coverage.txt ./...
      - run: go build -v ./...
```

## Performance Considerations

1. **CGO_ENABLED=0** - Fully static binaries
2. **Build flags** - `-ldflags="-w -s"` to strip debug info
3. **Goroutines** - Use for concurrent operations
4. **Buffered I/O** - Use bufio for file operations
5. **Connection Pooling** - Reuse HTTP clients
6. **Profiling** - Use pprof for performance analysis

## Monitoring

### Prometheus Metrics
```go
import "github.com/prometheus/client_golang/prometheus"

var requestCounter = prometheus.NewCounterVec(
    prometheus.CounterOpts{
        Name: "http_requests_total",
        Help: "Total HTTP requests",
    },
    []string{"method", "endpoint", "status"},
)
```

### Expvar
```go
import "expvar"

var requests = expvar.NewInt("requests")
requests.Add(1)
```
