@echo off
echo ========================================
echo Debug npm - Step by Step Test
echo ========================================
echo.

echo Step 1: Check if npm exists in PATH...
where npm
echo where npm completed
echo.

echo Step 2: Check PATH variable...
echo %PATH%
echo PATH check completed
echo.

echo Step 3: Try to run npm with full path...
if exist "C:\Program Files\nodejs\npm.cmd" (
    echo Found npm in Program Files
    "C:\Program Files\nodejs\npm.cmd" --version
) else (
    echo npm.cmd not found in Program Files
)

if exist "C:\Program Files (x86)\nodejs\npm.cmd" (
    echo Found npm in Program Files (x86)
    "C:\Program Files (x86)\nodejs\npm.cmd" --version
) else (
    echo npm.cmd not found in Program Files (x86)
)
echo.

echo Step 4: Check if node_modules exists...
if exist "node_modules" (
    echo node_modules folder exists
) else (
    echo node_modules folder NOT found
)
echo.

echo Step 5: Check if package.json exists...
if exist "package.json" (
    echo package.json found
) else (
    echo package.json NOT found
)
echo.

echo Step 6: Try to run npm with error handling...
echo Attempting to run npm --version...
npm --version 2>&1
echo npm command completed with errorlevel: %errorlevel%
echo.

echo Script completed successfully!
echo Press any key to exit...
pause >nul
