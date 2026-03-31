# JabilTest Language Support for Visual Studio

Esta carpeta contiene una version para Visual Studio (no VS Code).

## Que incluye

- Reconocimiento de archivos: `.jts`, `.t`, `.inc`, `.pln`, `.silk`
- Content type propio: `jabiltest`
- Resaltado basico de sintaxis para:
  - keywords
  - comentarios `//`
  - strings entre comillas

## Estructura

- `JabilTestVSExtension/JabilTestVSExtension.sln`
- `JabilTestVSExtension/JabilTestVSExtension.csproj`
- `JabilTestVSExtension/source.extension.vsixmanifest`
- `JabilTestVSExtension/JabilTestContentTypeDefinition.cs`
- `JabilTestVSExtension/JabilTestClassificationDefinitions.cs`
- `JabilTestVSExtension/JabilTestClassifier.cs`

## Compilar

1. Abrir `JabilTestVSExtension.sln` en Visual Studio 2022/2026.
2. Restaurar paquetes NuGet.
3. Compilar en `Release`.

Con `dotnet build` ya se valida que el codigo compile.

## Empaquetar como VSIX

La forma recomendada en Visual Studio es:

1. Crear un proyecto nuevo de tipo `VSIX Project` dentro de la misma solucion.
2. Agregar como `Project Reference` el proyecto `JabilTestVSExtension`.
3. En el manifiesto del VSIX, incluir el asset MEF del ensamblado.
4. Compilar el proyecto VSIX para obtener el archivo `.vsix` final.

## Instalacion

1. Doble clic en el `.vsix` generado por el proyecto VSIX.
2. Seleccionar Visual Studio Professional/Enterprise/Community.
3. Reiniciar Visual Studio.

## Nota importante

El error original ocurre porque el archivo `.vsix` previo tenia `Supported Products: Microsoft.VisualStudio.Code`, es decir, era solo para VS Code.

Esta implementacion es para Visual Studio y corrige ese problema de compatibilidad.
