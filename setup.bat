@echo off
REM ProofRevenue Development Setup Script (Windows)
REM Run this script to set up the project for development

setlocal enabledelayedexpansion

echo.
echo 🚀 ProofRevenue Development Setup
echo ==================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% detected

echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo.
    echo 📝 Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ⚠️  Update .env.local with your Stripe keys and database URL
)

echo.
echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo    1. Update .env.local with your Stripe keys
echo    2. Start dev server: npm run dev
echo    3. Open http://localhost:3000
echo    4. Use Tweaks Panel (⚙ bottom-left) to test states
echo.
echo Note: Database setup requires PostgreSQL to be installed and running
echo       Run: npm run db:setup
echo.

pause
