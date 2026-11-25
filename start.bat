@echo off
chcp 65001 >nul
title GUGUMI'S NEST
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
echo.
echo Server stopped. Press any key to close.
pause >nul
