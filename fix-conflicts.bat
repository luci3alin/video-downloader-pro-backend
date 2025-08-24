@echo off
echo 🔧 Removing Git conflict markers from all files...
echo.

REM Find and fix files with conflict markers
for /r %%f in (*) do (
    if not "%%~xf"==".git" (
        echo Checking: %%f
        powershell -Command "(Get-Content '%%f' -Raw -ErrorAction SilentlyContinue) -replace '<<<<<<< HEAD\r?\n', '' -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+\r?\n', '' -replace '=======\r?\n.*?>>>>>>> [a-f0-9]+', '' -replace '<<<<<<< HEAD\r?\n.*?=======\r?\n', '' -replace '>>>>>>> [a-f0-9]+\r?\n', '' | Set-Content '%%f' -NoNewline -ErrorAction SilentlyContinue"
    )
)

echo.
echo 🎉 All Git conflict markers have been removed!
echo 📝 You can now run: git add . && git commit -m "Fix merge conflicts"
pause
