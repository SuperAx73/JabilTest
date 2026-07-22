@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

set "EXT_ID=axielurenda.jabiltest-language-support"
set "EXT_VERSION=1.0.0"
set "EXT_FOLDER=%EXT_ID%-%EXT_VERSION%"
set "SOURCE_DIR=%~dp0"
set "INSTALLED_COUNT=0"

echo 🚀 JABILTEST EXTENSION V1 - INSTALACIÓN AUTOMÁTICA
echo ==================================================
echo.

echo 🪟 Sistema detectado: Windows

if exist "%USERPROFILE%\.vscode" (
    call :INSTALL_TO_EDITOR "VS Code" "%USERPROFILE%\.vscode\extensions" "code"
)

if exist "%USERPROFILE%\.vscode-insiders" (
    call :INSTALL_TO_EDITOR "VS Code Insiders" "%USERPROFILE%\.vscode-insiders\extensions" "code-insiders"
)

if exist "%APPDATA%\Cursor" (
    call :INSTALL_TO_EDITOR "Cursor" "%APPDATA%\Cursor\extensions" "cursor"
)

if "!INSTALLED_COUNT!"=="0" (
    echo ❌ Error: No se detectó VS Code, VS Code Insiders ni Cursor en este equipo.
    echo Ejecuta el editor al menos una vez y vuelve a correr este instalador.
    pause
    exit /b 1
)

echo.
echo 🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE!
echo ======================================
echo.
echo 🔄 PRÓXIMOS PASOS:
echo 1. Cierra y abre nuevamente tu editor (VS Code/Cursor)
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
exit /b 0

:INSTALL_TO_EDITOR
set "EDITOR_NAME=%~1"
set "EXT_DIR=%~2"
set "EDITOR_CMD=%~3"
set "TARGET_DIR=%EXT_DIR%\%EXT_FOLDER%"
set "VSIX_PATH=%SOURCE_DIR%jabiltest-language-support-%EXT_VERSION%.vsix"

echo 📁 %EDITOR_NAME% - Directorio de extensiones: %EXT_DIR%
if not exist "%EXT_DIR%" mkdir "%EXT_DIR%" >nul 2>nul

if exist "%VSIX_PATH%" (
    if not "%EDITOR_CMD%"=="" (
        where %EDITOR_CMD% >nul 2>nul
        if !errorlevel! EQU 0 (
            echo 📦 %EDITOR_NAME% - Instalando por VSIX metodo oficial
            %EDITOR_CMD% --install-extension "%VSIX_PATH%" --force >nul 2>nul
            if !errorlevel! EQU 0 (
                echo ✅ %EDITOR_NAME% - Instalado por VSIX
                set /a INSTALLED_COUNT+=1
                echo.
                goto :EOF
            )
            echo ⚠️  %EDITOR_NAME% - Fallo instalacion por VSIX. Se intentara copia manual.
        )
    )
)

echo 🗑️  %EDITOR_NAME% - Limpiando versiones anteriores...
for /d %%D in ("%EXT_DIR%\%EXT_ID%-*") do rmdir /s /q "%%~fD"

echo 📦 %EDITOR_NAME% - Copiando extensión...
mkdir "%TARGET_DIR%" >nul 2>nul
xcopy /E /I /Y "%SOURCE_DIR%*" "%TARGET_DIR%\" >nul

if not exist "%TARGET_DIR%\package.json" (
    echo ❌ %EDITOR_NAME% - Error: package.json no encontrado
    goto :EOF
)

if not exist "%TARGET_DIR%\server\out\server.js" (
    echo ❌ %EDITOR_NAME% - Error: Language Server no encontrado
    goto :EOF
)

if not exist "%TARGET_DIR%\syntaxes\jabiltest.tmLanguage.json" (
    echo ❌ %EDITOR_NAME% - Error: Sintaxis no encontrada
    goto :EOF
)

call :CLEAR_OBSOLETE_MARK "%EDITOR_NAME%" "%EXT_DIR%"

echo ✅ %EDITOR_NAME% - Instalado correctamente
set /a INSTALLED_COUNT+=1
echo.
goto :EOF

:CLEAR_OBSOLETE_MARK
set "EDITOR_NAME=%~1"
set "EXT_DIR=%~2"
set "OBS_FILE=%EXT_DIR%\.obsolete"

if not exist "%OBS_FILE%" goto :EOF

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$path = '%OBS_FILE%';" ^
  "$prefix = '%EXT_ID%-';" ^
  "if (Test-Path $path) {" ^
  "  $raw = Get-Content $path -Raw;" ^
  "  if (-not [string]::IsNullOrWhiteSpace($raw)) {" ^
  "    $obj = $raw | ConvertFrom-Json;" ^
  "    $changed = $false;" ^
  "    foreach ($name in @($obj.PSObject.Properties.Name)) {" ^
  "      if ($name -like ($prefix + '*')) {" ^
  "        $obj.PSObject.Properties.Remove($name);" ^
  "        $changed = $true;" ^
  "      }" ^
  "    }" ^
  "    if ($changed) { $obj | ConvertTo-Json -Compress | Set-Content -Encoding UTF8 $path }" ^
  "  }" ^
  "}"

if %errorlevel%==0 (
    echo 🧹 %EDITOR_NAME% - .obsolete verificado
) else (
    echo ⚠️  %EDITOR_NAME% - No se pudo actualizar .obsolete (continuando)
)
goto :EOF
