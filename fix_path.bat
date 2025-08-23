@echo off
echo ========================================
echo Fix PATH Variable - Add npm to PATH
echo ========================================
echo.

echo Current situation:
echo - Node.js: Working (v22.15.1)
echo - npm: Found but not in PATH
echo - npm location: C:\Program Files\nodejs\
echo.

echo This script will add npm to your PATH variable.
echo You need to run this as Administrator for it to work.
echo.

echo Checking if running as Administrator...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo To fix this:
    echo 1. Right-click on this file
    echo 2. Select "Run as administrator"
    echo 3. Run the script again
    echo.
    pause
    exit /b 1
)

echo Running as Administrator - OK!
echo.

echo Current PATH:
echo %PATH%
echo.

echo Adding npm to PATH...
setx PATH "%PATH%;C:\Program Files\nodejs" /M
if %errorlevel% neq 0 (
    echo ERROR: Failed to update PATH!
    echo.
    echo Manual solution:
    echo 1. Press Win + R, type "sysdm.cpl"
    echo 2. Go to "Advanced" tab
    echo 3. Click "Environment Variables"
    echo 4. Find "Path" in System variables
    echo 5. Click "Edit" and add: C:\Program Files\nodejs
    echo.
    pause
    exit /b 1
)

echo.
echo PATH updated successfully!
echo.
echo IMPORTANT: You need to restart your computer
echo or open a new Command Prompt for changes to take effect.
echo.
echo After restart, npm should work from anywhere.
echo.
echo Testing npm in current session...
set "PATH=%PATH%;C:\Program Files\nodejs"
npm --version
if %errorlevel% equ 0 (
    echo SUCCESS: npm is now working!
) else (
    echo npm still not working in current session
    echo (this is normal - restart required)
)

echo.
echo ========================================
echo PATH Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your computer
echo 2. Run setup.bat again
echo 3. npm should now work properly
echo.
echo Press any key to exit...
pause >nul
