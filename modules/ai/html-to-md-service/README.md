# Go HTML-to-Markdown Service

A high-performance Go-based microservice for converting HTML to Markdown format.

## Overview

This service provides a standalone HTTP API for converting HTML content to clean Markdown. It's used by the Firecrawl API to efficiently parse and convert scraped web content.

## Features

- **Fast HTML Parsing**: Efficient HTML processing using Go
- **Clean Markdown Output**: Produces well-formatted Markdown
- **HTTP API**: Simple REST endpoint for conversions
- **Standalone Service**: Microservice architecture for scalability

## API Endpoints

### POST /convert

Convert HTML to Markdown.

**Request Body:**
```json
{
  "html": "<h1>Hello World</h1><p>This is a test.</p>"
}
```

**Response:**
```json
{
  "markdown": "# Hello World\n\nThis is a test."
}
```

## Running the Service

### Using Go

```bash
cd apps/ai/go-html-to-md-service
go mod download
go run main.go
```

The service will start on port 8080 by default.

### Using Docker

```bash
cd apps/ai/go-html-to-md-service
docker build -t go-html-to-md .
docker run -p 8080:8080 go-html-to-md
```

### Using Docker Compose

```bash
cd apps/ai/go-html-to-md-service
docker-compose up
```

## Testing

```bash
# Run tests
go test ./...

# Test the API
curl -X POST http://localhost:8080/convert \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Test</h1>"}'
```

## Configuration

Environment variables:
- `PORT` - Server port (default: 8080)
- `LOG_LEVEL` - Logging level (default: info)

## Integration with Firecrawl

This service is called by the Firecrawl API when converting scraped HTML content to Markdown format. It provides better performance and cleaner Markdown output compared to JavaScript-based converters.

## Development

```bash
# Install dependencies
go mod download

# Run locally
go run main.go

# Build
make build

# Run tests
make test
```

## License

MIT
