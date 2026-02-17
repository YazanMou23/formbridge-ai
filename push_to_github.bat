@echo off
echo ==========================================
echo   FormBridge AI - GitHub Push Script
echo ==========================================
echo.

:: Check if Git is installed/available in this new window
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not found!
    echo Please make sure you installed Git and selected "Git from the command line".
    echo You may need to restart your computer if you just installed it.
    pause
    exit /b
)

echo [SUCCESS] Git found. Proceeding...
echo.

:: Initialize Git if not already
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git branch -M main
)

:: Configure User (Update these if needed, or git will ask)
:: git config user.name "Your Name"
:: git config user.email "your@email.com"

:: Add Remote
git remote add origin https://github.com/YazanMou23/formbridge-ai.git >nul 2>&1
:: If remote already exists, set url just in case
git remote set-url origin https://github.com/YazanMou23/formbridge-ai.git

:: Add Files
echo Adding files...
git add .

:: Commit
echo Committing files...
git commit -m "Auto-commit from script"

:: Push
echo Pushing to GitHub...
echo (You may be asked to sign in to GitHub in a browser)
git push -u origin main

:: If push fails, try force push (for the README conflict)
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Standard push failed. Trying verify/force push...
    git pull origin main --rebase
    git push -u origin main
)

echo.
echo ==========================================
echo   Done!
echo ==========================================
pause
