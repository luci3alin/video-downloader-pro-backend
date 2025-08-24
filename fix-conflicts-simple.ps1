# Simple script to remove Git conflict markers
Write-Host "🔧 Removing Git conflict markers..." -ForegroundColor Green

# List of files to fix (only source files)
$filesToFix = @(
    "server.js",
    "test-enhanced-v2.js", 
    "test-enhanced-detection.js",
    "test-ytdlp.js",
    "test.bat",
    "clickme.bat",
    "debug_npm.bat",
    "fix_npm.bat",
    "fix_path.bat",
    "setup.bat",
    "sw.js",
    "package.json",
    "package-lock.json",
    "render.yaml",
    ".gitignore",
    "README.md",
    "DEPLOYMENT.md",
    "DEPLOYMENT_INSTRUCTIONS.md"
)

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "🔧 Fixing: $file" -ForegroundColor Cyan
        try {
            $content = Get-Content $file -Raw -ErrorAction Stop
            
            # Remove conflict markers and keep only the first part (HEAD)
            $fixedContent = $content -replace '<<<<<<< HEAD\r?\n', '' `
                                    -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+\r?\n', '' `
                                    -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+', '' `
                                    -replace '<<<<<<< HEAD\r?\n.*?=======\r?\n', '' `
                                    -replace '>>>>>>> [a-f0-9]+\r?\n', ''
            
            Set-Content $file -Value $fixedContent -NoNewline -ErrorAction Stop
            Write-Host "✅ Fixed: $file" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error fixing $file : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "🎉 All Git conflict markers have been removed!" -ForegroundColor Green
Write-Host "📝 You can now run: git add . && git commit -m 'Fix merge conflicts'" -ForegroundColor Yellow
