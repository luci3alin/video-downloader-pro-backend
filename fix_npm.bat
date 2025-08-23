@echo off
echo ========================================
echo Fix npm Issues - Diagnostic & Solutions
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Node.js found. Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo PROBLEM FOUND: npm is not in PATH!
    echo ========================================
    echo.
    echo Solutions:
    echo.
    echo 1. REINSTALL NODE.JS (Recommended)
    echo    - Download from: https://nodejs.org/
    echo    - Make sure to check "Add to PATH" during installation
    echo    - Restart computer after installation
    echo.
    echo 2. MANUAL PATH FIX
    echo    - Add C:\Program Files\nodejs\ to your PATH
    echo    - Or C:\Program Files (x86)\nodejs\ if 32-bit
    echo.
    echo 3. CHECK ANTIVIRUS
    echo    - Some antivirus software blocks npm
    echo    - Try temporarily disabling it
    echo.
    echo Press any key to continue...
    pause >nul
    
    echo.
    echo Attempting to find npm manually...
    if exist "C:\Program Files\nodejs\npm.cmd" (
        echo Found npm at: C:\Program Files\nodejs\npm.cmd
        echo Testing it...
        "C:\Program Files\nodejs\npm.cmd" --version
        echo.
        echo You can add this path to your PATH variable
    ) else (
        echo npm.cmd not found in Program Files
    )
    
    if exist "C:\Program Files (x86)\nodejs\npm.cmd" (
        echo Found npm at: C:\Program Files (x86)\nodejs\npm.cmd
        echo Testing it...
        "C:\Program Files (x86)\nodejs\npm.cmd" --version
        echo.
        echo You can add this path to your PATH variable
    ) else (
        echo npm.cmd not found in Program Files (x86)
    )
    
) else (
    echo npm found in PATH
    echo Testing npm...
    npm --version
    echo npm is working correctly!
)

echo.
echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo If npm is still not working:
echo 1. Reinstall Node.js from https://nodejs.org/
echo 2. Make sure to check "Add to PATH" option
echo 3. Restart your computer
echo 4. Try running this script again
echo.
echo Press any key to exit...
pause >nul
