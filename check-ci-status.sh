#!/bin/bash
# ============================================
# VoltX CI/CD Status Checker
# Checks the status of GitHub Actions workflows
# ============================================

echo "🔍 VoltX CI/CD Status Checker"
echo "=============================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo ""
    echo "Install it:"
    echo "  Mac:     brew install gh"
    echo "  Windows: winget install GitHub.cli"
    echo "  Linux:   See https://cli.github.com/manual/installation"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo ""
    echo "Run: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI ready"
echo ""

# Get workflow runs
echo "📊 Recent Workflow Runs:"
echo "------------------------"
gh run list --limit 10

echo ""
echo "📈 Workflow Summary:"
echo "-------------------"

# Count successful and failed runs
TOTAL=$(gh run list --limit 50 --json conclusion --jq 'length')
SUCCESS=$(gh run list --limit 50 --json conclusion --jq '[.[] | select(.conclusion=="success")] | length')
FAILED=$(gh run list --limit 50 --json conclusion --jq '[.[] | select(.conclusion=="failure")] | length')

SUCCESS_RATE=$((SUCCESS * 100 / TOTAL))

echo "Total runs: $TOTAL"
echo "✅ Success: $SUCCESS"
echo "❌ Failed: $FAILED"
echo "📊 Success Rate: $SUCCESS_RATE%"

echo ""
echo "🐳 Docker Images:"
echo "----------------"

# List Docker images (requires GHCR access)
echo "Check images at: https://github.com/majdifox?tab=packages"

echo ""
echo "💡 Quick Commands:"
echo "------------------"
echo "  gh run list              # List all runs"
echo "  gh run view [ID]         # View specific run"
echo "  gh run watch             # Watch current run"
echo "  gh run rerun [ID]        # Rerun failed run"
echo "  gh workflow list         # List all workflows"
echo "  gh workflow run [NAME]   # Manually trigger workflow"

echo ""
echo "🌐 View on GitHub:"
echo "-----------------"
gh repo view --web
