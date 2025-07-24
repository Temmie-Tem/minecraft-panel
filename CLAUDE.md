# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a monorepo managed with npm workspaces. All applications are under `app/` directory.

### Build & Development
```bash
# Install all dependencies
npm run bootstrap

# Start individual services
npm run start:frontend    # Frontend dev server (Vite)
npm run start:backend     # Backend NestJS in dev mode  
npm run start:discord     # Discord bot development
npm run start:wings       # Wings daemon
npm run start:all         # All services concurrently

# Build all workspaces
npm run build
```

### Backend-specific commands (from app/backend/)
```bash
npm run start:dev         # Development with watch mode
npm run start:prod        # Production mode
npm run build            # Build for production
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
npm run test             # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Test coverage
```

### Frontend-specific commands (from app/mc-panel-frontend/)
```bash
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint
npm run preview          # Preview production build
```

## Architecture Overview

This is a **3-tier hybrid cloud Minecraft server management panel** with the following components:

### Core Components
- **Panel Backend** (`app/backend/`): NestJS API server with OAuth authentication, database management, and Wings integration
- **Panel Frontend** (`app/mc-panel-frontend/`): React + Vite dashboard for server management  
- **Wings Daemon** (`app/wings/`): Node.js service that manages Docker-based Minecraft servers on local hardware
- **Discord Bot** (`app/discord-bot/`): Optional Discord integration service

### Database Design
- **Primary DB**: Oracle Cloud ATP (Always Free tier) for production
- **Development DB**: SQLite for local development
- **Key entities**: Users, Nodes, Servers, Players, Sessions, Performance/Command/Gamemode logs, Punishments
- **Database configuration**: Supports both Oracle and SQLite via environment variables

### Authentication & Security
- **OAuth**: Google OAuth 2.0 for user authentication
- **JWT**: Token-based session management
- **CORS**: Configurable origins for cross-origin requests
- **Environment-based**: Separate configs for development/production

### Key Integration Points
- **Wings API**: RESTful API for Docker container management on remote nodes
- **Oracle Instant Client**: Windows-compatible Oracle client libraries in `app/backend/OracleDB/`
- **Oracle Wallet**: Database connection credentials in `app/backend/Wallet_temmieATP/`

## Environment Configuration

The backend requires these key environment variables:

```bash
# Database (Oracle for production, SQLite for development)
DB_TYPE=oracle|sqlite
DB_TNS_ADMIN=./Wallet_temmieATP    # Oracle wallet path
DB_CONNECT_STRING=                 # Oracle connection string
DB_USER=                          # Oracle username
DB_PASS=                          # Oracle password
DB_DATABASE=dev.sqlite            # SQLite file (if using SQLite)

# Authentication
JWT_SECRET=                       # Minimum 32 characters
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Wings Integration
WINGS_API_URL=http://localhost:8080

# CORS & Frontend
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Development Workflow

1. **Database Setup**: The backend automatically initializes Oracle client libraries and handles schema sync in development mode
2. **Wings Integration**: Wings daemon manages Minecraft servers via Docker, communicating with Panel through REST APIs
3. **Local Development**: Uses SQLite by default; set `DB_TYPE=oracle` for Oracle testing
4. **Production**: Designed for Oracle Cloud VM with ATP database and local Wings nodes

## Key Code Patterns

- **TypeORM Entities**: All database models in `app/backend/src/entities/` with Oracle/SQLite compatibility
- **NestJS Modules**: Auth, Wings, and core app modules with dependency injection
- **Environment Validation**: Joi schemas in `config/environment.config.ts` for runtime validation
- **Wings Communication**: HTTP client for Docker container lifecycle management