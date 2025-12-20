# Node.js Infrastructure

Shared Node.js/JavaScript development infrastructure for security domain projects.

## Projects Using Node.js

### CyberChef
- **Path**: `modules/security/cyberchef`
- **Purpose**: Web app for encryption, encoding, compression and data analysis
- **Stack**: Node.js, Webpack, Babel
- **Frontend**: Vanilla JavaScript (no framework)

### Dispatch
- **Path**: `modules/security/dispatch`
- **Purpose**: Incident management platform (frontend)
- **Stack**: Node.js, Vue.js, TypeScript
- **Additional**: Python backend (Django)

### Ghostwriter
- **Path**: `modules/security/ghostwriter/javascript`
- **Purpose**: Red team operations platform (frontend)
- **Stack**: Node.js, React, GraphQL (Hasura)

### VirusTotal MCP
- **Path**: `modules/security/virustotal-mcp`
- **Purpose**: Model Context Protocol server for VirusTotal API
- **Stack**: Node.js, TypeScript

### VS Code
- **Path**: `modules/security/vscode`
- **Purpose**: Code editor (extensive TypeScript/Node.js codebase)
- **Note**: Large monorepo with multiple Node packages

## Common Configuration Files

### package.json
```json
{
  "name": "security-app",
  "version": "1.0.0",
  "description": "Security domain application",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### .eslintrc.json
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "security"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn"
  },
  "env": {
    "node": true,
    "es2022": true
  }
}
```

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Dockerfile

```dockerfile
# Multi-stage build for Node.js applications
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

## Docker Compose

```yaml
services:
  nodejs-app:
    build:
      context: .
      dockerfile: Dockerfile
    image: security_nodejs_app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    networks:
      - security-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      - postgres
      - redis

networks:
  security-network:
```

## Common Dependencies

### Web Frameworks
- **Express.js**: Fast, minimalist web framework
- **Fastify**: High-performance web framework
- **NestJS**: Enterprise-grade progressive framework

### TypeScript
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `@types/*` - Type definitions

### Security
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `cors` - CORS middleware
- `express-validator` - Input validation
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens

### Database & ORM
- `pg` - PostgreSQL client
- `redis` - Redis client
- `prisma` - Modern ORM
- `typeorm` - TypeScript ORM
- `mongoose` - MongoDB ODM

### Testing
- `jest` - Testing framework
- `supertest` - HTTP testing
- `@testing-library/*` - React/DOM testing

### Build Tools
- `webpack` - Module bundler
- `vite` - Fast build tool
- `esbuild` - Fast bundler
- `rollup` - Module bundler

### Frontend (React/Vue)
- `react` - UI library
- `vue` - Progressive framework
- `next.js` - React framework
- `nuxt` - Vue framework

### GraphQL
- `apollo-client` - GraphQL client
- `@apollo/server` - GraphQL server
- `graphql` - GraphQL.js

## Environment Configuration

### .env.example
```bash
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d

# API Keys
VIRUSTOTAL_API_KEY=your-api-key
```

### config.ts
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    expiration: process.env.JWT_EXPIRATION || '7d',
  },
  apiKeys: {
    virusTotal: process.env.VIRUSTOTAL_API_KEY || '',
  },
};
```

## Express.js Application Structure

```
src/
├── index.ts                 # Entry point
├── app.ts                   # Express app setup
├── config/
│   ├── index.ts            # Configuration
│   └── database.ts         # DB configuration
├── routes/
│   ├── index.ts            # Route aggregator
│   ├── auth.routes.ts      # Auth routes
│   └── api.routes.ts       # API routes
├── controllers/
│   ├── auth.controller.ts
│   └── api.controller.ts
├── services/
│   ├── auth.service.ts
│   └── api.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── models/
│   └── user.model.ts
├── utils/
│   ├── logger.ts
│   └── helpers.ts
└── types/
    └── index.d.ts
```

## Testing

### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Example Test
```typescript
import request from 'supertest';
import app from '../app';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
});
```

## Security Best Practices

### Helmet Configuration
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

### Input Validation
```typescript
import { body, validationResult } from 'express-validator';

app.post('/api/user',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

## Performance Optimization

### Compression
```typescript
import compression from 'compression';
app.use(compression());
```

### Caching
```typescript
import redis from 'redis';

const client = redis.createClient({ url: config.redis.url });

// Cache middleware
const cacheMiddleware = async (req, res, next) => {
  const key = `cache:${req.url}`;
  const cached = await client.get(key);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  res.sendResponse = res.json;
  res.json = (body) => {
    client.setEx(key, 300, JSON.stringify(body));
    res.sendResponse(body);
  };
  
  next();
};
```

## Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

## Resources

- Node.js Documentation: https://nodejs.org/docs
- Express.js: https://expressjs.com
- TypeScript: https://www.typescriptlang.org
- Jest Testing: https://jestjs.io
- CyberChef: See `modules/security/cyberchef/` for complex webpack configuration
- VirusTotal MCP: See `modules/security/virustotal-mcp/` for MCP server implementation
