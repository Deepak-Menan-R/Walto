# Setup Script for Transaction Parser Frontend
# Run this script to set up the frontend development environment

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Walto Frontend - Setup" -ForegroundColor Cyan
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

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
cd walto-frontend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
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
    
    # Get local IP address
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
    
    if ($ip) {
        Write-Host "⚠ Please update .env with your backend URL" -ForegroundColor Yellow
        Write-Host "  Your computer's IP: $ip" -ForegroundColor Yellow
        Write-Host "  Example: EXPO_PUBLIC_API_URL=http://${ip}:3000" -ForegroundColor Yellow
    } else {
        Write-Host "⚠ Please update .env with your backend URL" -ForegroundColor Yellow
        Write-Host "  Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Frontend Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your backend URL" -ForegroundColor White
Write-Host "2. Ensure backend is running" -ForegroundColor White
Write-Host "3. Start Expo: npx expo start" -ForegroundColor White
Write-Host "4. Press 'a' to run on Android" -ForegroundColor White
Write-Host ""
