# Complete Setup Script - Sets up entire project
# Run this to set up both backend and frontend

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Walto - Complete Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$allGood = $true

# Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# PostgreSQL
$pgVersion = psql --version 2>$null
if ($pgVersion) {
    Write-Host "✓ PostgreSQL installed" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL not found (required for backend)" -ForegroundColor Yellow
}

if (-not $allGood) {
    Write-Host ""
    Write-Host "Please install missing prerequisites and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "walto-backend") {
    & .\setup-backend.ps1
} else {
    Write-Host "✗ Backend directory not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "walto-frontend") {
    & .\setup-frontend.ps1
} else {
    Write-Host "✗ Frontend directory not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! 🎉" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure Backend:" -ForegroundColor Yellow
Write-Host "   cd walto-backend" -ForegroundColor White
Write-Host "   Edit .env file" -ForegroundColor White
Write-Host "   createdb walto_db" -ForegroundColor White
Write-Host "   node scripts/setup-database.js" -ForegroundColor White
Write-Host ""
Write-Host "2. Configure Frontend:" -ForegroundColor Yellow
Write-Host "   cd walto-frontend" -ForegroundColor White
Write-Host "   Edit .env file" -ForegroundColor White
Write-Host ""
Write-Host "3. Start Development:" -ForegroundColor Yellow
Write-Host "   Terminal 1: cd walto-backend && npm run dev" -ForegroundColor White
Write-Host "   Terminal 2: cd walto-frontend && npx expo start" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Quick Start: QUICKSTART.md" -ForegroundColor White
Write-Host "   - Deployment: DEPLOYMENT.md" -ForegroundColor White
Write-Host "   - Full Docs: README.md" -ForegroundColor White
Write-Host ""
