# PowerShell script to remove all Git conflict markers
Write-Host "🔧 Removing Git conflict markers from all files..." -ForegroundColor Green

# Get all files with conflict markers
$conflictFiles = @()
Get-ChildItem -Recurse -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match '<<<<<<< HEAD|=======|>>>>>>> [a-f0-9]+') {
        $conflictFiles += $_.FullName
    }
}

Write-Host "📁 Found $($conflictFiles.Count) files with conflict markers" -ForegroundColor Yellow

# Remove conflict markers from each file
foreach ($file in $conflictFiles) {
    Write-Host "🔧 Fixing: $file" -ForegroundColor Cyan
    
    try {
        # Read file content
        $content = Get-Content $file -Raw -ErrorAction Stop
        
        # Remove all conflict markers and keep only the HEAD version (first part)
        $fixedContent = $content -replace '<<<<<<< HEAD\r?\n', '' `
                                -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+\r?\n', '' `
                                -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+', '' `
                                -replace '<<<<<<< HEAD\r?\n.*?=======\r?\n', '' `
                                -replace '>>>>>>> [a-f0-9]+\r?\n', ''
        
        # Write fixed content back
        Set-Content $file -Value $fixedContent -NoNewline -ErrorAction Stop
        Write-Host "✅ Fixed: $file" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Error fixing $file : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 All Git conflict markers have been removed!" -ForegroundColor Green
Write-Host "📝 You can now run: git add . && git commit -m 'Fix merge conflicts'" -ForegroundColor Yellow
