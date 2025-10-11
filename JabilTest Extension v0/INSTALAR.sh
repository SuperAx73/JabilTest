#!/bin/bash

echo "🚀 Instalando JabilTest Essential..."

# 1. Limpiar instalaciones anteriores
echo "🗑️  Limpiando instalaciones anteriores..."
rm -rf ~/.cursor/extensions/axielurenda.jabiltest-language-support*

# 2. Crear directorio de extensión
echo "📦 Instalando extensión..."
mkdir -p ~/.cursor/extensions/axielurenda.jabiltest-language-support-1.0.0

# 3. Copiar archivos esenciales
echo "📋 Copiando archivos esenciales..."
cp -r * ~/.cursor/extensions/axielurenda.jabiltest-language-support-1.0.0/

# 4. Configurar Cursor (si no está configurado)
echo "⚙️  Configurando Cursor..."
CURSOR_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"

# Crear backup si existe
if [ -f "$CURSOR_SETTINGS" ]; then
    cp "$CURSOR_SETTINGS" "$CURSOR_SETTINGS.backup"
fi

# Verificar si ya tiene configuración de JabilTest
if ! grep -q '"files.associations"' "$CURSOR_SETTINGS" 2>/dev/null; then
    echo "Configurando archivos de asociación..."
    # Esta configuración se debe hacer manualmente en Cursor
    echo "⚠️  IMPORTANTE: Configura manualmente en Cursor:"
    echo "   1. Abre Configuración (Cmd+,)"
    echo "   2. Busca 'files.associations'"
    echo "   3. Agrega: \"*.jts\": \"jabiltest\""
fi

echo "✅ Instalación completada!"
echo ""
echo "🔄 PRÓXIMOS PASOS:"
echo "1. Reinicia Cursor completamente"
echo "2. Abre 'TorqueDess BS.jts'"
echo "3. Verifica que aparezca 'JabilTest' en la barra inferior"
echo "4. Si no funciona, configura manualmente files.associations en Cursor"

