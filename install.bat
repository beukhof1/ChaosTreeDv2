@echo off
setlocal ENABLEDELAYEDEXPANSION

echo ============================================
echo ChaosTreeDv2 - Install script
echo ============================================
echo.

REM --- Check Node.js is installed ---
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not on PATH.
    echo         Please install Node.js LTS (18+ recommended) from https://nodejs.org/
    exit /b 1
)

REM --- Check Node.js major version >= 18 ---
node -e "process.exit(Number(process.versions.node.split('.')[0]) < 18 ? 1 : 0)" >nul 2>nul
if errorlevel 1 (
    for /f "tokens=1" %%v in ('node -v') do set NODEVER=%%v
    echo [ERROR] Your Node.js version !NODEVER! is too old.
    echo         Please upgrade to Node.js 18 or higher.
    exit /b 1
)

REM --- Check npm is available ---
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not available. It should be installed together with Node.js.
    exit /b 1
)

echo [INFO] Installing npm dependencies...
echo.

npm install
if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed.
    echo         Check the error messages above.
    exit /b 1
)

echo.
echo [SUCCESS] All dependencies installed successfully.
echo.
echo You can now start the dev server with:
echo   run.bat   (or: npm run dev)
echo.

pause
endlocal
