# 🚀 VoltX Quick Start Guide

Complete guide to running VoltX locally with Docker and deploying with CI/CD.

---

## 🎯 What You Get

✅ **Docker Setup** - Run entire app with one command
✅ **CI/CD Pipeline** - Automatic testing and deployment
✅ **Production Ready** - Deploy to cloud with push

---

## 📦 Local Development (Docker)

### Run Everything Locally

**Windows:**
```cmd
# Double-click or run in terminal
start-docker.bat
```

**Mac/Linux:**
```bash
# Make executable and run
chmod +x start-docker.sh
./start-docker.sh
```

**Or use docker-compose directly:**
```bash
docker-compose up --build
```

### Access Your App

- 🌐 **Frontend**: http://localhost
- 🔧 **Backend API**: http://localhost:8080
- 🗄️ **Database**: localhost:5432

### Stop Everything

```bash
docker-compose down
```

### Clean Restart

```bash
docker-compose down -v
docker-compose up --build
```

📖 **Full Docker docs:** [DOCKER_README.md](./DOCKER_README.md)

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Setup (One Time)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit with Docker and CI/CD"
   git branch -M main
   git remote add origin https://github.com/majdifox/VoltX.git
   git push -u origin main
   ```

2. **Enable GitHub Actions**
   - Go to **Actions** tab on GitHub
   - Click "I understand my workflows, go ahead and enable them"

3. **Enable Packages (for Docker)**
   - Go to **Settings** → **Actions** → **General**
   - Scroll to **Workflow permissions**
   - Select **"Read and write permissions"**
   - Click **Save**

### What Happens Automatically

Every time you push code:

```
Push Code
    ↓
🧪 Backend Tests Run
    ↓
🏗️ Frontend Build
    ↓
🐳 Docker Images Built
    ↓
📦 Pushed to Registry
    ↓
🚀 Deploy (optional)
    ↓
✅ Done!
```

### Check Status

**Option 1: GitHub Web**
- Go to **Actions** tab
- See all workflows and their status

**Option 2: Command Line**
```bash
# Windows
check-ci-status.bat

# Mac/Linux
./check-ci-status.sh
```

**Option 3: Status Badges**

Add to your `README.md`:
```markdown
![Backend CI](https://github.com/majdifox/VoltX/workflows/Backend%20CI/CD/badge.svg)
![Frontend CI](https://github.com/majdifox/VoltX/workflows/Frontend%20CI/CD/badge.svg)
```

📖 **Full CI/CD docs:** [CI_CD_README.md](./CI_CD_README.md)

---

## 📋 Development Workflow

### Daily Development

1. **Start Docker** (local development)
   ```bash
   docker-compose up -d
   ```

2. **Make changes** to code

3. **Test locally**
   ```bash
   # Backend tests
   cd VoltX_Backend
   mvn test

   # Frontend lint
   cd VoltX_Frontend
   npm run lint
   ```

4. **Commit with conventional commits**
   ```bash
   git add .
   git commit -m "feat: add user profile page"
   git push
   ```

5. **Watch CI/CD run** automatically on GitHub

### Feature Development (Best Practice)

1. **Create feature branch**
   ```bash
   git checkout -b feature/user-profile
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add user profile component"
   git push origin feature/user-profile
   ```

3. **Create Pull Request** on GitHub
   - PR validation runs automatically
   - Tests must pass before merge
   - Get review from teammate (optional)

4. **Merge to main**
   - Full CI/CD pipeline runs
   - Docker images built
   - Deploy to production (if enabled)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 VoltX Platform                  │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Frontend │  │ Backend  │  │ Database │
  │React+Nginx│  │Spring Boot│  │PostgreSQL│
  │  Port 80  │  │ Port 8080│  │Port 5432│
  └──────────┘  └──────────┘  └──────────┘
        │             │             │
        └─────────────┴─────────────┘
              Docker Network

┌─────────────────────────────────────────────────┐
│              CI/CD Pipeline                     │
└─────────────────────────────────────────────────┘
        │
        ├─> Backend CI: Test + Build
        ├─> Frontend CI: Lint + Build
        ├─> Docker Build: Create Images
        └─> Deploy: Push to Production
```

---

## 🎓 For Your Defense

### What to Say

> "The application uses Docker for containerization and GitHub Actions for CI/CD. Developers can run the entire stack locally with one command. Every code push triggers automated tests, builds Docker images, and deploys to production. This ensures code quality, enables rapid iteration, and makes deployment trivial."

### Demo Flow

1. **Show Docker Setup**
   - Run `docker-compose up`
   - Show app running at localhost
   - Show all 3 services running

2. **Show CI/CD**
   - Open GitHub Actions tab
   - Show successful pipeline runs
   - Click into a workflow, show detailed logs

3. **Make Live Change**
   - Change frontend code (e.g., button text)
   - Commit and push
   - Watch workflow run in real-time
   - Show deployed change

### Key Points to Emphasize

✅ **One-command deployment** - No manual steps
✅ **Automated testing** - Catches bugs before production
✅ **Docker containers** - Consistent environment everywhere
✅ **Infrastructure as code** - Everything in Git
✅ **Professional DevOps** - Industry-standard tools

---

## 📚 File Structure

```
VoltX_Fil_Rouge/
├── 📄 docker-compose.yml          # Main orchestration
├── 📄 DOCKER_README.md            # Docker documentation
├── 📄 CI_CD_README.md             # CI/CD documentation
├── 📄 QUICK_START.md              # This file
├── 🎬 start-docker.bat/sh         # Quick start scripts
├── 🛑 stop-docker.bat             # Stop script
├── 🔍 check-ci-status.bat/sh      # CI status checker
│
├── VoltX_Backend/
│   ├── Dockerfile                 # Backend container
│   ├── .dockerignore              # Docker exclude files
│   └── ... (Java source)
│
├── VoltX_Frontend/
│   ├── Dockerfile                 # Frontend container
│   ├── nginx.conf                 # Web server config
│   ├── .dockerignore              # Docker exclude files
│   └── ... (React source)
│
└── .github/workflows/
    ├── backend-ci.yml             # Backend testing
    ├── frontend-ci.yml            # Frontend testing
    ├── docker-build.yml           # Docker image building
    ├── ci-cd-complete.yml         # Full pipeline
    ├── pr-validation.yml          # PR checks
    ├── labeler.yml                # Auto-labeling
    └── dependabot.yml             # Dependency updates
```

---

## 🆘 Troubleshooting

### Docker Issues

| Problem | Solution |
|---------|----------|
| Port already in use | Stop other services or change port |
| Backend won't start | Wait longer, check database health |
| Frontend blank page | Check backend is running |
| Database errors | Run `docker-compose down -v` |

### CI/CD Issues

| Problem | Solution |
|---------|----------|
| Workflow not running | Enable GitHub Actions |
| Docker push fails | Enable write permissions |
| Tests fail | Check PostgreSQL service |
| Slow builds | First run; subsequent runs cached |

### Get Help

1. **Check logs**
   ```bash
   # Docker
   docker-compose logs -f

   # GitHub Actions
   gh run view [ID]
   ```

2. **Read documentation**
   - [DOCKER_README.md](./DOCKER_README.md) - Full Docker guide
   - [CI_CD_README.md](./CI_CD_README.md) - Full CI/CD guide

3. **Clean restart**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up --build
   ```

---

## ⏱️ Typical Times

| Task | First Time | Subsequent |
|------|-----------|------------|
| Docker build | 3-5 min | 30 sec |
| Backend tests | 2-3 min | 1-2 min |
| Frontend build | 2-3 min | 1 min |
| Docker image build | 5-7 min | 2-3 min |
| Full CI/CD pipeline | 8-10 min | 5-6 min |

---

## ✅ Pre-Defense Checklist

Before your project defense:

- [ ] Docker runs successfully (`docker-compose up`)
- [ ] All 3 services accessible (frontend, backend, database)
- [ ] GitHub repository created and pushed
- [ ] GitHub Actions enabled and running
- [ ] At least one successful CI/CD pipeline run
- [ ] Docker images in GitHub Container Registry
- [ ] You understand the architecture
- [ ] You can explain Docker vs. traditional deployment
- [ ] You can explain CI/CD benefits
- [ ] Screenshots/recordings of working system

---

## 🎉 Congratulations!

You now have:
- ✅ Professional Docker setup
- ✅ Automated CI/CD pipeline
- ✅ Production-ready deployment
- ✅ Industry-standard DevOps

**Everything you need to impress during your defense!** 🚀

---

## 📞 Quick Reference

```bash
# Start local development
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Push code (triggers CI/CD)
git add .
git commit -m "feat: your message"
git push

# Check CI/CD status
gh run list
```

---

**Ready to deploy? Push to GitHub and watch the magic happen!** ✨
