#!/bin/bash

echo "========================================"
echo "Video Downloader Pro - Setup Script"
echo "========================================"
echo

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please download and install Node.js from: https://nodejs.org/"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Node.js found. Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not working properly"
    echo "Please reinstall Node.js"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo
echo "Installing Node.js dependencies..."
echo "This may take a few minutes..."
echo

# Create error log file
ERROR_LOG="setup_errors.txt"
echo "Setup started at: $(date)" > "$ERROR_LOG"

# Install dependencies and capture output
if npm install 2>&1 | tee -a "$ERROR_LOG"; then
    echo
    echo "========================================"
    echo "Setup Complete!"
    echo "========================================"
    echo
    echo "To start the video downloader:"
    echo "1. Run: npm start"
    echo "2. Open: http://localhost:3000"
    echo
    echo "Note: You need Node.js installed on your system."
    echo "Download from: https://nodejs.org/"
    echo
else
    echo
    echo "========================================"
    echo "SETUP FAILED!"
    echo "========================================"
    echo
    echo "Errors occurred during installation."
    echo "Check the file: $ERROR_LOG"
    echo
    echo "Common solutions:"
    echo "1. Make sure you have internet connection"
    echo "2. Try running with sudo (Linux/Mac)"
    echo "3. Check if firewall is blocking npm"
    echo "4. Try: npm cache clean --force"
    echo
    read -p "Press Enter to view error log..."
    if command -v nano &> /dev/null; then
        nano "$ERROR_LOG"
    elif command -v vim &> /dev/null; then
        vim "$ERROR_LOG"
    else
        cat "$ERROR_LOG"
    fi
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

read -p "Press Enter to continue..."
