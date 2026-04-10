# Setup Script for Transaction Parser Backend
# Run this script to set up the development environment

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Walto Backend - Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgVersion = psql --version 2>$null
if ($pgVersion) {
    Write-Host "✓ PostgreSQL installed" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL not found. Please install PostgreSQL 15+" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
cd walto-backend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check for .env file
Write-Host ""
if (Test-Path ".env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠ Please edit .env with your configuration" -ForegroundColor Yellow
    Write-Host "  - Add your OpenAI API key" -ForegroundColor Yellow
    Write-Host "  - Update DATABASE_URL" -ForegroundColor Yellow
    Write-Host "  - Generate JWT_SECRET: openssl rand -base64 32" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Backend Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Create database: createdb walto_db" -ForegroundColor White
Write-Host "3. Run setup: node scripts/setup-database.js" -ForegroundColor White
Write-Host "4. Start server: npm run dev" -ForegroundColor White
Write-Host ""
