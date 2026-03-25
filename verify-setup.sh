#!/bin/bash
# ============================================
# VoltX Setup Verification Script
# Checks that all CI/CD and Docker files are ready
# ============================================

echo "🔍 VoltX Setup Verification"
echo "=========================="
echo ""

# Check current directory
if [[ ! -f "docker-compose.yml" ]]; then
    echo "❌ Please run this from the VOLTX_git directory"
    echo "   cd VOLTX_git && ./verify-setup.sh"
    exit 1
fi

echo "✅ Running from correct directory"
echo ""

# Check Docker files
echo "🐳 Docker Files:"
echo "---------------"
if [[ -f "docker-compose.yml" ]]; then
    echo "✅ docker-compose.yml"
else
    echo "❌ docker-compose.yml MISSING"
fi

if [[ -f "VoltX_Backend/Dockerfile" ]]; then
    echo "✅ VoltX_Backend/Dockerfile"
else
    echo "❌ VoltX_Backend/Dockerfile MISSING"
fi

if [[ -f "VoltX_Frontend/Dockerfile" ]]; then
    echo "✅ VoltX_Frontend/Dockerfile"
else
    echo "❌ VoltX_Frontend/Dockerfile MISSING"
fi

if [[ -f "VoltX_Frontend/nginx.conf" ]]; then
    echo "✅ VoltX_Frontend/nginx.conf"
else
    echo "❌ VoltX_Frontend/nginx.conf MISSING"
fi

echo ""

# Check CI/CD files
echo "🔄 CI/CD Workflows:"
echo "------------------"
WORKFLOWS=(
    "backend-ci.yml"
    "frontend-ci.yml"
    "docker-build.yml"
    "ci-cd-complete.yml"
    "pr-validation.yml"
)

for workflow in "${WORKFLOWS[@]}"; do
    if [[ -f ".github/workflows/$workflow" ]]; then
        echo "✅ .github/workflows/$workflow"
    else
        echo "❌ .github/workflows/$workflow MISSING"
    fi
done

if [[ -f ".github/dependabot.yml" ]]; then
    echo "✅ .github/dependabot.yml"
else
    echo "❌ .github/dependabot.yml MISSING"
fi

if [[ -f ".github/labeler.yml" ]]; then
    echo "✅ .github/labeler.yml"
else
    echo "❌ .github/labeler.yml MISSING"
fi

echo ""

# Check documentation
echo "📚 Documentation:"
echo "----------------"
DOCS=(
    "CI_CD_README.md"
    "DOCKER_README.md"
    "QUICK_START.md"
)

for doc in "${DOCS[@]}"; do
    if [[ -f "$doc" ]]; then
        echo "✅ $doc"
    else
        echo "❌ $doc MISSING"
    fi
done

echo ""

# Check scripts
echo "🎬 Helper Scripts:"
echo "----------------"
SCRIPTS=(
    "start-docker.bat"
    "start-docker.sh"
    "stop-docker.bat"
    "check-ci-status.bat"
    "check-ci-status.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [[ -f "$script" ]]; then
        echo "✅ $script"
    else
        echo "❌ $script MISSING"
    fi
done

echo ""

# Check Git setup
echo "🔧 Git Setup:"
echo "-------------"
if [[ -f ".gitignore" ]]; then
    echo "✅ .gitignore"
else
    echo "❌ .gitignore MISSING"
fi

if git status &>/dev/null; then
    echo "✅ Git repository initialized"

    # Check remote
    if git remote -v | grep -q "origin"; then
        REMOTE_URL=$(git remote get-url origin)
        echo "✅ Git remote: $REMOTE_URL"
    else
        echo "⚠️  No git remote configured yet"
        echo "   Add with: git remote add origin https://github.com/majdifox/VoltX.git"
    fi
else
    echo "❌ Not a git repository"
    echo "   Initialize with: git init"
fi

echo ""

# Quick commands
echo "⚡ Quick Commands:"
echo "----------------"
echo "  ./start-docker.sh        # Start local development"
echo "  docker-compose up        # Alternative start"
echo "  docker-compose down      # Stop all services"
echo "  ./check-ci-status.sh     # Check GitHub Actions"
echo "  git add . && git commit -m 'feat: add CI/CD and Docker setup'"
echo "  git push origin main     # Push to GitHub (triggers CI/CD)"

echo ""

# Final status
MISSING_FILES=0
TOTAL_FILES=0

# Count files
for file in docker-compose.yml VoltX_Backend/Dockerfile VoltX_Frontend/Dockerfile VoltX_Frontend/nginx.conf; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    if [[ ! -f "$file" ]]; then
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

for workflow in "${WORKFLOWS[@]}"; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    if [[ ! -f ".github/workflows/$workflow" ]]; then
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

echo "📊 Summary:"
echo "----------"
if [[ $MISSING_FILES -eq 0 ]]; then
    echo "🎉 All files present and ready!"
    echo "✅ Docker setup: Ready to run"
    echo "✅ CI/CD setup: Ready for GitHub"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Start Docker: ./start-docker.sh"
    echo "  2. Test locally: http://localhost"
    echo "  3. Push to GitHub for CI/CD"
else
    echo "⚠️  $MISSING_FILES of $TOTAL_FILES files missing"
    echo "   Please copy missing files before proceeding"
fi

echo ""
echo "📖 Read full documentation: QUICK_START.md"