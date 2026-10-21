@echo off
title Crear Acceso Directo de AgroCaldas en el Escritorio
color 2f

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'AgroCaldas.lnk')); $s.TargetPath = '%~dp0Abrir_AgroCaldas.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'AgroCaldas - Gestion Agricola Anserma Caldas'; $s.Save()"

echo ===================================================================
echo     Acceso directo de AgroCaldas creado en su Escritorio!
echo ===================================================================
echo Ahora puede abrir AgroCaldas con un solo clic desde su Escritorio.
echo.
pause
