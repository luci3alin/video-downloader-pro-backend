@echo off
echo 🔧 Removing Git conflict markers from source files only...
echo.

REM Only process specific file types and exclude system directories
for /r %%f in (*.js *.jsx *.ts *.tsx *.html *.css *.md *.txt *.bat *.ps1 *.yaml *.yml *.json) do (
    echo Checking: %%f
    powershell -Command "try { $content = Get-Content '%%f' -Raw -ErrorAction Stop; if ($content -match '<<<<<<< HEAD|=======|>>>>>>> [a-f0-9]+') { $fixed = $content -replace '<<<<<<< HEAD\r?\n', '' -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+\r?\n', '' -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+', '' -replace '<<<<<<< HEAD\r?\n.*?=======\r?\n', '' -replace '>>>>>>> [a-f0-9]+\r?\n', ''; Set-Content '%%f' -Value $fixed -NoNewline; Write-Host 'Fixed: %%f' -ForegroundColor Green } } catch { Write-Host 'Skipped: %%f' -ForegroundColor Yellow }"
)

echo.
echo 🎉 Git conflict markers have been removed from source files!
echo 📝 You can now run: git add . && git commit -m "Fix merge conflicts"
pause
