@echo off
chcp 65001 >nul
echo ==========================================
echo  NexaMed - Script de Despliegue Railway
echo ==========================================
echo.

REM Verificar argumentos
if "%~1"=="" goto :help
if "%~1"=="help" goto :help
if "%~1"=="build" goto :build
if "%~1"=="backend" goto :backend
if "%~1"=="frontend" goto :frontend
goto :help

:help
echo Uso: deploy-railway.bat [comando]
echo.
echo Comandos disponibles:
echo   build      - Crear build de produccion del frontend
echo   backend    - Preparar backend para Railway
echo   frontend   - Preparar frontend para Railway
echo   help       - Mostrar esta ayuda
echo.
echo Ejemplo:
echo   deploy-railway.bat build
echo.
goto :end

:build
echo [1/3] Instalando dependencias del frontend...
cd NexaMed-Frontend
call npm install
if errorlevel 1 goto :error

echo.
echo [2/3] Creando build de produccion...
call npm run build
if errorlevel 1 goto :error

echo.
echo [3/3] Build completado!
echo   - Archivos en: NexaMed-Frontend\dist\
echo   - Listo para subir a Railway
echo.
cd ..
goto :end

:backend
echo Preparando backend para Railway...
echo.
echo Archivos creados:
echo   - Procfile
echo   - runtime.txt
echo   - composer.json
echo   - router.php
echo   - seed.php
echo.
echo Pasos manuales:
echo 1. Subir codigo a GitHub:
echo    git add .
echo    git commit -m "Ready for Railway"
echo    git push origin main
echo.
echo 2. En Railway:
echo    - Crear nuevo proyecto desde GitHub
echo    - Agregar MySQL
echo    - Ejecutar /seed para inicializar BD
echo.
goto :end

:frontend
echo Preparando frontend para Railway...
echo.
echo IMPORTANTE: Actualizar URL del backend en:
echo   NexaMed-Frontend\src\services\api.ts
echo.
echo Pasos:
echo 1. Editar api.ts y cambiar API_BASE_URL
echo 2. Ejecutar: deploy-railway.bat build
echo 3. Subir a GitHub
echo 4. Desplegar en Railway o Vercel
echo.
goto :end

:error
echo.
echo ERROR: El comando fallo
echo.
goto :end

:end
echo.
echo ==========================================
echo  Script completado
echo ==========================================
pause
