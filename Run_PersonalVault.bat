@echo off
title PersonalVault Launcher
echo ===================================================
echo   Starting PersonalVault Secure Local Server...
echo ===================================================
echo.

:: Get the directory of this batch file
set BASE_DIR=%~dp0

:: Change directory to the Django app directory (where manage.py is)
cd /d "%BASE_DIR%PersonalVault\PersonalVault"

:: Start the Django server in a minimized window
start "PersonalVault Django Server" /min "..\venv\Scripts\python.exe" manage.py runserver

echo Server is starting up...
timeout /t 3 /nobreak >nul

:: Open the default browser to the home page
echo Opening PersonalVault in your browser...
start http://127.0.0.1:8000/

echo.
echo ============================================================
echo   PersonalVault is now running!
echo   Keep this window open while using the application.
echo.
echo   Press any key in this window to STOP the server and exit.
echo ============================================================
echo.
pause

:: Cleanly terminate the Django server when exiting
taskkill /FI "WINDOWTITLE eq PersonalVault Django Server*" /T /F >nul 2>&1
echo Server stopped. Exiting...
timeout /t 2 >nul
