@echo off
title Pornire server Video Downloader Pro
color 0a

echo.
echo Salut, Adi! Scriptul asta o sa faca toata treaba pentru tine, stai pe spate sefule
echo (nu chiar, mai trebuie sa apesi si tu 2-3 clickuri pe aici pe acolo).
echo ===========================================
echo  1. Verificam ce avem instalat...
echo ===========================================
echo.

:: Sa speram ca suntem in folderul corect
cd /d "%~dp0"

:: ne uitam sa vedem daca Node.js e instalat
:: sigur nu e, iti dai seama!
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Node.js nu a fost gasit (logic).
    echo E musai sa-l instalezi frate! Dupa aia continuam.
    echo Il iei de aici: https://nodejs.org/
    echo Dupa ce il instalezi, double-click iar pe fisierul asta.
    echo.
    pause
    exit /b 1
) else (
    echo Node.js a fost gasit. Misto! (NU CREDEAM!!!!)
)

echo.
echo ===========================================
echo  2. Instalare dependente cu npm...
echo ===========================================
echo.
echo Te rog, ai oleaca rabdare, poate dura cateva minute (de obicei sub un minut).
npm install

if %errorlevel% neq 0 (
    echo.
    echo A aparut o eroare la instalarea dependentelor.
    echo Vezi daca ai platit netul luna asta.
    echo.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo  3. Ii dam o cheie la server...
echo ===========================================
echo.

:: Peste 3 secunde presimt ca serverul porneste!
ping 127.0.0.1 -n 3 > nul
npm start

echo.
echo ===========================================
echo  Serverul a fost oprit. Pa!
echo ===========================================
echo.
=======
@echo off
title Pornire server Video Downloader Pro
color 0a

echo.
echo Salut, Adi! Scriptul asta o sa faca toata treaba pentru tine, stai pe spate sefule
echo (nu chiar, mai trebuie sa apesi si tu 2-3 clickuri pe aici pe acolo).
echo ===========================================
echo  1. Verificam ce avem instalat...
echo ===========================================
echo.

:: Sa speram ca suntem in folderul corect
cd /d "%~dp0"

:: ne uitam sa vedem daca Node.js e instalat
:: sigur nu e, iti dai seama!
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Node.js nu a fost gasit (logic).
    echo E musai sa-l instalezi frate! Dupa aia continuam.
    echo Il iei de aici: https://nodejs.org/
    echo Dupa ce il instalezi, double-click iar pe fisierul asta.
    echo.
    pause
    exit /b 1
) else (
    echo Node.js a fost gasit. Misto! (NU CREDEAM!!!!)
)

echo.
echo ===========================================
echo  2. Instalare dependente cu npm...
echo ===========================================
echo.
echo Te rog, ai oleaca rabdare, poate dura cateva minute (de obicei sub un minut).
npm install

if %errorlevel% neq 0 (
    echo.
    echo A aparut o eroare la instalarea dependentelor.
    echo Vezi daca ai platit netul luna asta.
    echo.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo  3. Ii dam o cheie la server...
echo ===========================================
echo.

:: Peste 3 secunde presimt ca serverul porneste!
ping 127.0.0.1 -n 3 > nul
npm start

echo.
echo ===========================================
echo  Serverul a fost oprit. Pa!
echo ===========================================
echo.
pause