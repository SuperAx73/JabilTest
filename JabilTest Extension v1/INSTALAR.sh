#!/bin/bash

EXT_ID="axielurenda.jabiltest-language-support"
EXT_VERSION="1.0.0"
EXT_FOLDER="$EXT_ID-$EXT_VERSION"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALLED_COUNT=0

echo "🚀 JABILTEST EXTENSION V1 - INSTALACIÓN AUTOMÁTICA"
echo "=================================================="
echo ""

install_to_editor() {
    local editor_name="$1"
    local ext_dir="$2"
    local target_dir="$ext_dir/$EXT_FOLDER"

    echo "📁 $editor_name - Directorio de extensiones: $ext_dir"
    mkdir -p "$ext_dir"

    echo "🗑️  $editor_name - Limpiando versiones anteriores..."
    rm -rf "$ext_dir"/$EXT_ID-*

    echo "📦 $editor_name - Copiando extensión..."
    mkdir -p "$target_dir"
    cp -R "$SOURCE_DIR"/* "$target_dir/"

    if [ ! -f "$target_dir/package.json" ]; then
        echo "❌ $editor_name - Error: package.json no encontrado"
        return
    fi

    if [ ! -f "$target_dir/server/out/server.js" ]; then
        echo "❌ $editor_name - Error: Language Server no encontrado"
        return
    fi

    if [ ! -f "$target_dir/syntaxes/jabiltest.tmLanguage.json" ]; then
        echo "❌ $editor_name - Error: Sintaxis no encontrada"
        return
    fi

    clear_obsolete_mark "$editor_name" "$ext_dir"

    echo "✅ $editor_name - Instalado correctamente"
    echo ""
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
}

clear_obsolete_mark() {
    local editor_name="$1"
    local ext_dir="$2"
    local obs_file="$ext_dir/.obsolete"

    if [ ! -f "$obs_file" ]; then
        return
    fi

    if command -v python3 >/dev/null 2>&1; then
        python3 - <<PY
import json
path = r"$obs_file"
prefix = r"$EXT_ID-"
try:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    changed = False
    for key in list(data.keys()):
        if key.startswith(prefix):
            del data[key]
            changed = True
    if changed:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"))
except Exception:
    pass
PY
        echo "🧹 $editor_name - .obsolete verificado"
    else
        echo "⚠️  $editor_name - python3 no disponible; no se pudo verificar .obsolete"
    fi
}

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Sistema detectado: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Sistema detectado: Linux"
else
    echo "❌ Sistema operativo no soportado por este script: $OSTYPE"
    exit 1
fi

if [ -d "$HOME/.vscode" ]; then
    install_to_editor "VS Code" "$HOME/.vscode/extensions"
fi

if [ -d "$HOME/.vscode-insiders" ]; then
    install_to_editor "VS Code Insiders" "$HOME/.vscode-insiders/extensions"
fi

if [ -d "$HOME/.cursor" ]; then
    install_to_editor "Cursor" "$HOME/.cursor/extensions"
fi

if [ "$INSTALLED_COUNT" -eq 0 ]; then
    echo "❌ Error: No se detectó VS Code, VS Code Insiders ni Cursor en este equipo."
    echo "Ejecuta el editor al menos una vez y vuelve a correr este instalador."
    exit 1
fi

echo ""
echo "🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE!"
echo "======================================"
echo ""
echo "🔄 PRÓXIMOS PASOS:"
echo "1. Cierra y abre nuevamente tu editor (VS Code/Cursor)"
echo "3. Abre un archivo .jts"
echo "4. Verifica que aparezca 'JabilTest' en la barra inferior"
echo ""
echo "🔍 ARCHIVO DE PRUEBA:"
echo "- Abre 'TorqueDess BS.jts'"
echo "- Deberías ver errores marcados en rojo en las líneas 448-454"
echo ""
echo "⚙️  CONFIGURACIÓN MANUAL (si es necesario):"
echo "- Cursor → Configuración (Cmd+, o Ctrl+,)"
echo "- Busca 'files.associations'"
echo "- Agrega: \"*.jts\": \"jabiltest\""
echo ""
echo "✅ FUNCIONALIDADES INCLUIDAS:"
echo "- ✅ Resaltado de sintaxis"
echo "- ✅ Autocompletado de funciones"
echo "- ✅ Detección de errores en tiempo real"
echo "- ✅ Snippets predefinidos"
echo "- ✅ 500+ funciones JabilTest reconocidas"

exit 0
