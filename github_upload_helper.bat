@echo off
REM GitHub Upload Helper Script for AstroHELP (Windows Version)

echo 🚀 AstroHELP GitHub Upload Helper
echo ==================================

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo ✅ Git is installed

REM Initialize repository if not already done
if not exist ".git" (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add all files
echo 📦 Adding all files to Git...
git add .
echo ✅ All files added

REM Check status
echo 🔍 Git status:
git status

REM Create initial commit
echo 📝 Creating initial commit...
git commit -m "Initial commit: AstroHELP - Advanced Space Tourism & Management System"
echo ✅ Initial commit created

echo.
echo 📋 Next steps:
echo 1. Create a new repository on GitHub (https://github.com/new)
echo 2. Don't initialize it with README, .gitignore, or license
echo 3. Run the following commands in your terminal:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
echo    git push -u origin main
echo.
echo 🎉 Your AstroHELP project will be uploaded to GitHub!

pause