@echo off
title AgroCaldas - Sistema Agricola Anserma Caldas
color 2f

echo ===================================================================
echo                     AGROCALDAS - ANSERMA, CALDAS
echo ===================================================================
echo  Abriendo aplicacion directamente sin servidores ni puertos de red...
echo  (Inmune a bloqueos de firewall, politicas de red o antivirus)
echo ===================================================================
echo.

set "APP_FILE=%~dp0AgroCaldas_Standalone.html"

REM 1. Probar abrir con Microsoft Edge en Modo Aplicacion (Ventana Limpia sin barra de URL)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_FILE%"
    goto :fin
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_FILE%"
    goto :fin
)

REM 2. Probar con Google Chrome en Modo Aplicacion
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///%APP_FILE%"
    goto :fin
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="file:///%APP_FILE%"
    goto :fin
)

REM 3. Si no, abrir directamente con el navegador predeterminado de Windows
start "" "%APP_FILE%"

:fin
echo AgroCaldas se ha abierto exitosamente en su pantalla.
timeout /t 3 >nul
exit
