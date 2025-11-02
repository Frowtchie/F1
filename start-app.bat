@echo off
echo ========================================
echo   Starting Frowtch F1 Analytics App
echo ========================================
echo.
echo Smart F1 Data Analytics - Auto-detects real vs sample data
echo.
echo Open: http://localhost:5000
echo.

cd /d "%~dp0"
.venv\Scripts\python.exe app.py

echo.
echo Server stopped. Press any key to exit...
pause > nul