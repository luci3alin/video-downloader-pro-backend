@echo off
echo ========================================
echo Video Downloader Pro - Setup Script
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Node.js found. Checking npm...
echo Testing npm command...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not working properly
    echo Please reinstall Node.js
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo npm version check completed successfully
echo.

echo Testing npm command output...
npm --version
echo npm command completed
echo.

echo Testing if we can continue...
echo This is a test message to see if script continues
echo.

echo Installing Node.js dependencies...
echo This may take a few minutes...
echo.

REM Create error log file
set "ERROR_LOG=setup_errors.txt"
echo Setup started at: %date% %time% > "%ERROR_LOG%"
echo. >> "%ERROR_LOG%"
echo Starting npm install... >> "%ERROR_LOG%"
echo. >> "%ERROR_LOG%"

REM Test file creation
echo Test: Error log file created successfully >> "%ERROR_LOG%"
echo Error log file created at: %ERROR_LOG%
echo.

REM Install dependencies and capture output
echo Installing packages, please wait...
echo This will be logged to: %ERROR_LOG%
echo.

REM Use full path to npm since it's not in PATH
set "NPM_PATH=C:\Program Files\nodejs\npm.cmd"
if not exist "%NPM_PATH%" (
    set "NPM_PATH=C:\Program Files (x86)\nodejs\npm.cmd"
)

echo Using npm from: %NPM_PATH%
echo.

"%NPM_PATH%" install > "%ERROR_LOG%" 2>&1
echo.
echo npm install completed. Checking results...
echo.

REM Check if npm install was successful
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo SETUP FAILED!
    echo ========================================
    echo.
    echo Errors occurred during installation.
echo Check the file: %ERROR_LOG%
echo.
echo Common solutions:
echo 1. Make sure you have internet connection
echo 2. Try running as Administrator
echo 3. Check if antivirus is blocking npm
echo 4. Try: npm cache clean --force
echo.
echo Press any key to view error log...
pause >nul
echo.
echo Opening error log file...
notepad "%ERROR_LOG%"
echo.
echo Press any key to exit...
pause >nul
exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo All dependencies installed successfully!
echo Installation log saved to: %ERROR_LOG%
echo.
echo To start the video downloader:
echo 1. Run: npm start
echo 2. Open: http://localhost:3000
echo.
echo Note: You need Node.js installed on your system.
echo Download from: https://nodejs.org/
echo.
echo Press any key to exit...
pause >nul
=======
@echo off
echo ========================================
echo Video Downloader Pro - Setup Script
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Node.js found. Checking npm...
echo Testing npm command...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not working properly
    echo Please reinstall Node.js
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo npm version check completed successfully
echo.

echo Testing npm command output...
npm --version
echo npm command completed
echo.

echo Testing if we can continue...
echo This is a test message to see if script continues
echo.

echo Installing Node.js dependencies...
echo This may take a few minutes...
echo.

REM Create error log file
set "ERROR_LOG=setup_errors.txt"
echo Setup started at: %date% %time% > "%ERROR_LOG%"
echo. >> "%ERROR_LOG%"
echo Starting npm install... >> "%ERROR_LOG%"
echo. >> "%ERROR_LOG%"

REM Test file creation
echo Test: Error log file created successfully >> "%ERROR_LOG%"
echo Error log file created at: %ERROR_LOG%
echo.

REM Install dependencies and capture output
echo Installing packages, please wait...
echo This will be logged to: %ERROR_LOG%
echo.

REM Use full path to npm since it's not in PATH
set "NPM_PATH=C:\Program Files\nodejs\npm.cmd"
if not exist "%NPM_PATH%" (
    set "NPM_PATH=C:\Program Files (x86)\nodejs\npm.cmd"
)

echo Using npm from: %NPM_PATH%
echo.

"%NPM_PATH%" install > "%ERROR_LOG%" 2>&1
echo.
echo npm install completed. Checking results...
echo.

REM Check if npm install was successful
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo SETUP FAILED!
    echo ========================================
    echo.
    echo Errors occurred during installation.
echo Check the file: %ERROR_LOG%
echo.
echo Common solutions:
echo 1. Make sure you have internet connection
echo 2. Try running as Administrator
echo 3. Check if antivirus is blocking npm
echo 4. Try: npm cache clean --force
echo.
echo Press any key to view error log...
pause >nul
echo.
echo Opening error log file...
notepad "%ERROR_LOG%"
echo.
echo Press any key to exit...
pause >nul
exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo All dependencies installed successfully!
echo Installation log saved to: %ERROR_LOG%
echo.
echo To start the video downloader:
echo 1. Run: npm start
echo 2. Open: http://localhost:3000
echo.
echo Note: You need Node.js installed on your system.
echo Download from: https://nodejs.org/
echo.
echo Press any key to exit...
pause >nul
