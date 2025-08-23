@echo off
echo ========================================
echo Test Script - Debug npm issue
echo ========================================
echo.

echo Step 1: Testing Node.js...
node --version
echo Node.js test completed
echo.

echo Step 2: Testing npm...
npm --version
echo npm test completed
echo.

echo Step 3: Testing if script continues...
echo This message should appear after npm test
echo.

echo Step 4: Final test...
echo Script is still running
echo.

echo Press any key to exit...
pause >nul
