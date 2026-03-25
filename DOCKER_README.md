# 🐳 VoltX Docker Setup Guide

## Overview

This Docker setup runs the entire VoltX application with **one command**:

```bash
docker-compose up --build
```

## 📁 File Structure

```
VoltX_Fil_Rouge/
├── docker-compose.yml          ← Main orchestration file
├── VoltX_Backend/
│   ├── Dockerfile              ← Backend container config
│   └── .dockerignore           ← Files to exclude from Docker build
├── VoltX_Frontend/
│   ├── Dockerfile              ← Frontend container config
│   ├── nginx.conf              ← Nginx web server config
│   └── .dockerignore           ← Files to exclude from Docker build
```

## 🚀 Quick Start

### Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)

Check if installed:
```bash
docker --version
docker-compose --version
```

### 1. Build and Run Everything

Navigate to the project root:
```bash
cd c:/Users/blade/Desktop/Fixed_VoltX/VOLTX_EDGE_18th_march/VoltX_Fil_Rouge/VoltX_Fil_Rouge
```

Start all services:
```bash
docker-compose up --build
```

**What happens:**
- ✅ PostgreSQL database starts
- ✅ Spring Boot backend builds and starts
- ✅ React frontend builds and starts with Nginx
- ✅ All services connect automatically

### 2. Access the Application

Once running (wait ~2 minutes for first build):

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432 (if you need direct access)

### 3. Stop Everything

Press `Ctrl+C` in the terminal, then:

```bash
docker-compose down
```

## 📋 Common Commands

### Start (detached mode - runs in background)
```bash
docker-compose up -d
```

### Stop
```bash
docker-compose down
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### View logs
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Restart a specific service
```bash
docker-compose restart backend
```

### Remove everything (including volumes)
```bash
docker-compose down -v
```
⚠️ This deletes the database data!

## 🔧 Configuration

### Environment Variables

All configuration is in `docker-compose.yml`:

**Database:**
- `POSTGRES_DB`: voltx_fil
- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: 15111964bmw

**Backend:**
- `SERVER_PORT`: 8080
- `SPRING_DATASOURCE_URL`: jdbc:postgresql://database:5432/voltx_fil

### Ports

- **Frontend**: Port 80 (http://localhost)
- **Backend**: Port 8080 (http://localhost:8080)
- **Database**: Port 5432

To change ports, edit `docker-compose.yml`:
```yaml
ports:
  - "NEW_PORT:CONTAINER_PORT"
```

## 🐛 Troubleshooting

### Port already in use

If you get "port already in use" error:

**Option 1:** Stop the service using that port
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill
```

**Option 2:** Change the port in `docker-compose.yml`

### Backend not connecting to database

Wait longer - the backend has a health check that retries for 60 seconds. First startup takes time because:
1. Database initializes
2. Backend creates tables
3. Backend waits for database health check

### Clean slate restart

Remove everything and start fresh:
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Check service status
```bash
docker-compose ps
```

### Access container shell

If you need to debug inside a container:

```bash
# Backend
docker exec -it voltx-backend sh

# Database
docker exec -it voltx-database psql -U postgres -d voltx_fil

# Frontend
docker exec -it voltx-frontend sh
```

## 📦 What Each File Does

### `docker-compose.yml`
- Orchestrates all services (database, backend, frontend)
- Configures networking between containers
- Sets environment variables
- Manages volumes for data persistence

### `VoltX_Backend/Dockerfile`
- **Stage 1**: Builds the Spring Boot application with Maven
- **Stage 2**: Creates lightweight runtime image with just the JAR
- Uses **multi-stage build** to reduce final image size

### `VoltX_Frontend/Dockerfile`
- **Stage 1**: Builds React app with Node.js
- **Stage 2**: Serves built files with Nginx
- Production-ready static file serving

### `VoltX_Frontend/nginx.conf`
- Routes API requests to backend (`/api/` → `backend:8080`)
- Handles React Router (SPA routing)
- Enables WebSocket support (`/ws/` → backend)
- Optimizes with gzip and caching

## 🎯 Production Tips

For production deployment:

1. **Use environment variables** - Don't hardcode passwords
2. **Use secrets management** - Docker secrets or external vault
3. **Add health checks** - Already included!
4. **Use reverse proxy** - Put everything behind Nginx or Traefik
5. **Enable HTTPS** - Add SSL certificates
6. **Monitor logs** - Use logging service like ELK stack

## 🔍 How It Works

```
┌─────────────────────────────────────────────────┐
│  docker-compose.yml                             │
│  ├─ database (PostgreSQL)                       │
│  ├─ backend (Spring Boot)                       │
│  └─ frontend (React + Nginx)                    │
└─────────────────────────────────────────────────┘
           │
           ├─> Creates voltx-network (bridge)
           ├─> Creates volumes for persistence
           └─> Starts services in order:
                  1. database (with health check)
                  2. backend (waits for database)
                  3. frontend (depends on backend)

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│    Backend   │────▶│   Database   │
│  (Nginx:80)  │     │  (Spring:8080)│     │(PostgreSQL)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                    voltx-network
```

## ✅ Verification Checklist

After running `docker-compose up --build`:

- [ ] All 3 services are running: `docker-compose ps`
- [ ] Frontend accessible: http://localhost
- [ ] Backend API responds: http://localhost:8080/api/health (if endpoint exists)
- [ ] No errors in logs: `docker-compose logs`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)

## 🆘 Need Help?

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Check service status: `docker-compose ps`
3. Try clean restart: `docker-compose down -v && docker-compose up --build`

---

**Created for VoltX Fil Rouge Project** 🏔️⚡
