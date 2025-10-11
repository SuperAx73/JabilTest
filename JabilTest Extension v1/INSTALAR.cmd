@echo off
REM Script universal que detecta el sistema operativo
REM y ejecuta el instalador apropiado

echo 🚀 JABILTEST EXTENSION V1 - INSTALADOR UNIVERSAL
echo ================================================

REM Detectar si estamos en Windows
if "%OS%"=="Windows_NT" (
    echo 🪟 Sistema detectado: Windows
    echo Ejecutando instalador para Windows...
    call INSTALAR.bat
) else (
    echo 🐧 Sistema detectado: Unix/Linux/macOS
    echo Ejecutando instalador para Unix...
    if exist "INSTALAR.sh" (
        bash INSTALAR.sh
    ) else (
        echo ❌ Error: INSTALAR.sh no encontrado
        echo Por favor, ejecuta INSTALAR.sh manualmente
    )
)

pause
