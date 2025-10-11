@echo off
chcp 65001 >nul
echo 🚀 JABILTEST EXTENSION V1 - INSTALACIÓN AUTOMÁTICA
echo ==================================================
echo.

REM Verificar si Cursor está instalado
if not exist "%APPDATA%\Cursor" (
    echo ❌ Error: Cursor no está instalado o no se encuentra en la ubicación esperada
    echo Por favor, instala Cursor desde: https://cursor.sh/
    pause
    exit /b 1
)

echo 🪟 Sistema detectado: Windows
set CURSOR_EXTENSIONS=%APPDATA%\Cursor\extensions
echo 📁 Directorio de extensiones: %CURSOR_EXTENSIONS%
echo.

REM 1. Limpiar instalaciones anteriores
echo 🗑️  PASO 1: Limpiando instalaciones anteriores...
if exist "%CURSOR_EXTENSIONS%\axielurenda.jabiltest-language-support*" (
    rmdir /s /q "%CURSOR_EXTENSIONS%\axielurenda.jabiltest-language-support*"
)

REM 2. Crear directorio de extensión
echo 📦 PASO 2: Creando directorio de extensión...
mkdir "%CURSOR_EXTENSIONS%\axielurenda.jabiltest-language-support-1.0.0" 2>nul

REM 3. Copiar archivos esenciales
echo 📋 PASO 3: Copiando archivos esenciales...
xcopy /E /I /Y * "%CURSOR_EXTENSIONS%\axielurenda.jabiltest-language-support-1.0.0\" >nul

REM 4. Verificar instalación
echo ✅ PASO 4: Verificando instalación...
if exist "%CURSOR_EXTENSIONS%\axielurenda.jabiltest-language-support-1.0.0\package.json" (
    echo ✅ package.json instalado correctamente
) else (
    echo ❌ Error: package.json no encontrado
    pause
    exit /b 1
)

if exist "%CURSOR_EXTENSIONS%\axielurenda.jabiltest-language-support-1.0.0\server\out\server.js" (
    echo ✅ Language Server instalado correctamente
) else (
    echo ❌ Error: Language Server no encontrado
    pause
    exit /b 1
)

if exist "%CURSOR_EXTENSIONS%\axielurenda.jabiltest-language-support-1.0.0\syntaxes\jabiltest.tmLanguage.json" (
    echo ✅ Sintaxis instalada correctamente
) else (
    echo ❌ Error: Sintaxis no encontrada
    pause
    exit /b 1
)

echo.
echo 🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE!
echo ======================================
echo.
echo 🔄 PRÓXIMOS PASOS:
echo 1. Cierra Cursor completamente
echo 2. Abre Cursor de nuevo
echo 3. Abre un archivo .jts
echo 4. Verifica que aparezca 'JabilTest' en la barra inferior
echo.
echo 🔍 ARCHIVO DE PRUEBA:
echo - Abre 'TorqueDess BS.jts'
echo - Deberías ver errores marcados en rojo en las líneas 448-454
echo.
echo ⚙️  CONFIGURACIÓN MANUAL (si es necesario):
echo - Cursor → Configuración (Ctrl+,)
echo - Busca 'files.associations'
echo - Agrega: "*.jts": "jabiltest"
echo.
echo ✅ FUNCIONALIDADES INCLUIDAS:
echo - ✅ Resaltado de sintaxis
echo - ✅ Autocompletado de funciones
echo - ✅ Detección de errores en tiempo real
echo - ✅ Snippets predefinidos
echo - ✅ 500+ funciones JabilTest reconocidas
echo.
pause
