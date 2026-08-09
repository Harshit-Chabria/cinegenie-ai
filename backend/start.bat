@echo off
echo Starting CineGenie AI Backend...
echo.

REM Check if Python 3.12 is available via py launcher
py -3.12 --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Using Python 3.12
    py -3.12 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) else (
    REM Fall back to system python
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
)
