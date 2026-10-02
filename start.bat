@echo off
rem NeuroScope one-click launcher for Windows.
rem Creates/uses a project-local virtual environment (never touches global Python).

setlocal
cd /d "%~dp0"
set VENV_DIR=%~dp0venv
set PY=%VENV_DIR%\Scripts\python.exe

echo ============================================
echo   NeuroScope - starting up
echo ============================================

if not exist "%PY%" (
    echo [1/3] Creating project virtual environment...
    where py >nul 2>nul
    if errorlevel 1 (
        python -m venv "%VENV_DIR%"
    ) else (
        py -3 -m venv "%VENV_DIR%"
    )
    if not exist "%PY%" (
        echo ERROR: could not create venv. Is Python 3.11+ installed and on PATH?
        pause
        exit /b 1
    )
) else (
    echo [1/3] Virtual environment found.
)

echo [2/3] Installing dependencies (quiet)...
"%PY%" -m pip install --quiet --upgrade pip
"%PY%" -m pip install --quiet -r "%~dp0requirements.txt"
if errorlevel 1 (
    echo ERROR: dependency installation failed.
    pause
    exit /b 1
)

echo [3/3] Launching NeuroScope at http://127.0.0.1:8000 ...
start "" http://127.0.0.1:8000
"%PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
endlocal
