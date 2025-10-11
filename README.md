# 🎯 JabilTest Language Support

Extensión completa para soporte de lenguaje JabilTest en Cursor/VS Code con resaltado de sintaxis, autocompletado y detección de errores en tiempo real.

## 📋 Características

- ✅ **Resaltado de sintaxis** completo para archivos `.jts`
- ✅ **Autocompletado** de 500+ funciones JabilTest
- ✅ **Detección de errores** en tiempo real
- ✅ **Snippets predefinidos** para funciones comunes
- ✅ **Language Server Protocol** (LSP) completo
- ✅ **Compatibilidad** con Windows, macOS y Linux

## 🚀 Instalación

### Windows
1. Descomprimir `JabilTest-Extension-v1-Universal.zip`
2. Hacer doble clic en `INSTALAR.bat`
3. Reiniciar Cursor

### macOS/Linux
1. Descomprimir `JabilTest-Extension-v1.zip`
2. Ejecutar `./INSTALAR.sh`
3. Reiniciar Cursor

### Universal
1. Descomprimir `JabilTest-Extension-v1-Universal.zip`
2. Hacer doble clic en `INSTALAR.cmd`

## 📁 Estructura del Proyecto

```
├── JabilTest Extension v0/          # Versión inicial
├── JabilTest Extension v1/          # Versión mejorada
├── JabilTest-Extension-v0.zip       # Archivo v0
├── JabilTest-Extension-v1.zip       # Archivo v1 (macOS/Linux)
├── JabilTest-Extension-v1-Universal.zip # Archivo universal
└── README.md                        # Este archivo
```

## 🎯 Versiones Disponibles

### v0 - Versión Inicial
- Instalación básica
- Archivos esenciales
- README simple

### v1 - Versión Mejorada (Recomendada)
- Instalación automática multiplataforma
- Instrucciones detalladas
- Sintaxis corregida
- Scripts para Windows, macOS y Linux
- Guía completa de solución de problemas

## 🔧 Desarrollo

Para desarrollar o modificar la extensión:

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Compilar: `npm run compile`
4. Probar en Cursor

## 📝 Archivos de Configuración

- `package.json` - Configuración de la extensión
- `language-configuration.json` - Configuración del lenguaje
- `syntaxes/jabiltest.tmLanguage.json` - Resaltado de sintaxis
- `snippets/jabiltest.json` - Snippets de autocompletado
- `server/` - Language Server Protocol

## 🎉 Funcionalidades

### Resaltado de Sintaxis
- Keywords de JabilTest
- Funciones estándar
- Variables y tipos
- Comentarios y strings

### Autocompletado
- 500+ funciones JabilTest reconocidas
- Parámetros y tipos
- Documentación integrada
- Snippets predefinidos

### Detección de Errores
- Sintaxis básica
- Funciones no reconocidas
- Parámetros incorrectos
- Variables no definidas

## 📞 Soporte

Si tienes problemas con la instalación:
1. Verificar que Cursor esté actualizado
2. Revisar logs de desarrollador
3. Intentar instalación manual paso a paso

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno.

---

**Autor:** Superx73  
**Versión:** 1.0.0  
**Última actualización:** Octubre 2024
