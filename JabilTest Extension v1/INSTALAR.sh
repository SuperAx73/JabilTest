#!/bin/bash

echo "🚀 JABILTEST EXTENSION V1 - INSTALACIÓN AUTOMÁTICA"
echo "=================================================="
echo ""

# Verificar sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Sistema detectado: macOS"
    CURSOR_EXTENSIONS="$HOME/.cursor/extensions"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Sistema detectado: Linux"
    CURSOR_EXTENSIONS="$HOME/.cursor/extensions"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Sistema detectado: Windows"
    CURSOR_EXTENSIONS="$APPDATA/Cursor/extensions"
else
    echo "❌ Sistema operativo no reconocido: $OSTYPE"
    exit 1
fi

echo "📁 Directorio de extensiones: $CURSOR_EXTENSIONS"
echo ""

# 1. Limpiar instalaciones anteriores
echo "🗑️  PASO 1: Limpiando instalaciones anteriores..."
rm -rf "$CURSOR_EXTENSIONS"/axielurenda.jabiltest-language-support*

# 2. Crear directorio de extensión
echo "📦 PASO 2: Creando directorio de extensión..."
mkdir -p "$CURSOR_EXTENSIONS/axielurenda.jabiltest-language-support-1.0.0"

# 3. Copiar archivos esenciales
echo "📋 PASO 3: Copiando archivos esenciales..."
cp -r * "$CURSOR_EXTENSIONS/axielurenda.jabiltest-language-support-1.0.0/"

# 4. Verificar instalación
echo "✅ PASO 4: Verificando instalación..."
if [ -f "$CURSOR_EXTENSIONS/axielurenda.jabiltest-language-support-1.0.0/package.json" ]; then
    echo "✅ package.json instalado correctamente"
else
    echo "❌ Error: package.json no encontrado"
    exit 1
fi

if [ -f "$CURSOR_EXTENSIONS/axielurenda.jabiltest-language-support-1.0.0/server/out/server.js" ]; then
    echo "✅ Language Server instalado correctamente"
else
    echo "❌ Error: Language Server no encontrado"
    exit 1
fi

if [ -f "$CURSOR_EXTENSIONS/axielurenda.jabiltest-language-support-1.0.0/syntaxes/jabiltest.tmLanguage.json" ]; then
    echo "✅ Sintaxis instalada correctamente"
else
    echo "❌ Error: Sintaxis no encontrada"
    exit 1
fi

echo ""
echo "🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE!"
echo "======================================"
echo ""
echo "🔄 PRÓXIMOS PASOS:"
echo "1. Cierra Cursor completamente"
echo "2. Abre Cursor de nuevo"
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
