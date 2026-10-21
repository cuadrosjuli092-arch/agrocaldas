@echo off
title AgroCaldas - Gestion Agricola Anserma Caldas
color 2f
echo ========================================================
echo       Iniciando AgroCaldas (Anserma, Caldas)
echo ========================================================
echo Abriendo servidor web local y navegador...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1"
pause
