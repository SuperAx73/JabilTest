"use strict";
/**
 * Servidor de lenguaje para JabilTest
 * Autor: Axiel Urenda
 * Descripción: Implementa el Language Server Protocol para proporcionar
 * funciones avanzadas como autocompletado, verificación de errores y más
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
// Crear conexión para el servidor
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Crear un administrador de documentos
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// Variables globales
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
// Configuración global
const defaultSettings = {
    maxNumberOfProblems: 1000,
    enableAutoComplete: true,
    enableErrorChecking: true,
    enableIntelliSense: true,
    languagePath: '',
    registeredDLLs: []
};
let globalSettings = defaultSettings;
// Cache de configuración de documentos
const documentSettings = new Map();
// Funciones estándar de SilkTest/4Test
const standardFunctions = new Map();
// Inicializar funciones estándar
function initializeStandardFunctions() {
    // Funciones de control de flujo
    addFunction('call', 'Llama a una función o procedimiento', [
        { name: 'functionName', type: 'string', description: 'Nombre de la función a llamar' },
        { name: 'parameters', type: 'any', description: 'Parámetros de la función', optional: true }
    ], 'void', 'Control de Flujo');
    addFunction('function', 'Define una nueva función', [
        { name: 'name', type: 'string', description: 'Nombre de la función' },
        { name: 'parameters', type: 'string', description: 'Parámetros de la función', optional: true },
        { name: 'body', type: 'string', description: 'Cuerpo de la función' }
    ], 'void', 'Definición de Funciones');
    addFunction('return', 'Retorna un valor de una función', [
        { name: 'value', type: 'any', description: 'Valor a retornar', optional: true }
    ], 'void', 'Control de Flujo');
    addFunction('if', 'Estructura condicional', [
        { name: 'condition', type: 'boolean', description: 'Condición a evaluar' },
        { name: 'thenBlock', type: 'string', description: 'Código a ejecutar si la condición es verdadera' },
        { name: 'elseBlock', type: 'string', description: 'Código a ejecutar si la condición es falsa', optional: true }
    ], 'void', 'Control de Flujo');
    addFunction('while', 'Bucle while', [
        { name: 'condition', type: 'boolean', description: 'Condición del bucle' },
        { name: 'body', type: 'string', description: 'Código a ejecutar en cada iteración' }
    ], 'void', 'Control de Flujo');
    addFunction('for', 'Bucle for', [
        { name: 'initialization', type: 'string', description: 'Inicialización del bucle' },
        { name: 'condition', type: 'boolean', description: 'Condición del bucle' },
        { name: 'increment', type: 'string', description: 'Incremento del bucle' },
        { name: 'body', type: 'string', description: 'Código a ejecutar en cada iteración' }
    ], 'void', 'Control de Flujo');
    addFunction('break', 'Sale de un bucle', [], 'void', 'Control de Flujo');
    addFunction('continue', 'Continúa con la siguiente iteración del bucle', [], 'void', 'Control de Flujo');
    // Funciones de configuración de pruebas
    addFunction('SetTestName', 'Establece el nombre de la prueba', [
        { name: 'testName', type: 'string', description: 'Nombre de la prueba' }
    ], 'void', 'Configuración de Pruebas');
    addFunction('SetTestGroupName', 'Establece el nombre del grupo de pruebas', [
        { name: 'groupName', type: 'string', description: 'Nombre del grupo de pruebas' }
    ], 'void', 'Configuración de Pruebas');
    addFunction('SetProductName', 'Establece el nombre del producto', [
        { name: 'productName', type: 'string', description: 'Nombre del producto' }
    ], 'void', 'Configuración de Pruebas');
    addFunction('SetAbortFunction', 'Establece la función de aborto', [
        { name: 'abortFunction', type: 'string', description: 'Nombre de la función de aborto' }
    ], 'void', 'Configuración de Pruebas');
    addFunction('SetFailFunction', 'Establece la función de fallo', [
        { name: 'failFunction', type: 'string', description: 'Nombre de la función de fallo' }
    ], 'void', 'Configuración de Pruebas');
    addFunction('SetFinalizeFunction', 'Establece la función de finalización', [
        { name: 'finalizeFunction', type: 'string', description: 'Nombre de la función de finalización' }
    ], 'void', 'Configuración de Pruebas');
    // Funciones de manejo de errores
    addFunction('Abort', 'Aborta la ejecución de la prueba', [], 'void', 'Manejo de Errores');
    addFunction('AbortAllTests', 'Aborta todas las pruebas', [], 'void', 'Manejo de Errores');
    addFunction('AbortTestCell', 'Aborta la celda de prueba', [], 'void', 'Manejo de Errores');
    // Funciones matemáticas
    addFunction('Abs', 'Valor absoluto', [
        { name: 'number', type: 'number', description: 'Número del cual obtener el valor absoluto' }
    ], 'number', 'Matemáticas');
    addFunction('Add', 'Suma dos números', [
        { name: 'a', type: 'number', description: 'Primer número' },
        { name: 'b', type: 'number', description: 'Segundo número' }
    ], 'number', 'Matemáticas');
    addFunction('Subtract', 'Resta dos números', [
        { name: 'a', type: 'number', description: 'Minuendo' },
        { name: 'b', type: 'number', description: 'Sustraendo' }
    ], 'number', 'Matemáticas');
    addFunction('Multiply', 'Multiplica dos números', [
        { name: 'a', type: 'number', description: 'Primer número' },
        { name: 'b', type: 'number', description: 'Segundo número' }
    ], 'number', 'Matemáticas');
    addFunction('Divide', 'Divide dos números', [
        { name: 'a', type: 'number', description: 'Dividendo' },
        { name: 'b', type: 'number', description: 'Divisor' }
    ], 'number', 'Matemáticas');
    addFunction('Power', 'Eleva un número a una potencia', [
        { name: 'base', type: 'number', description: 'Base' },
        { name: 'exponent', type: 'number', description: 'Exponente' }
    ], 'number', 'Matemáticas');
    addFunction('SquareRoot', 'Raíz cuadrada', [
        { name: 'number', type: 'number', description: 'Número del cual obtener la raíz cuadrada' }
    ], 'number', 'Matemáticas');
    addFunction('NaturalLog', 'Logaritmo natural', [
        { name: 'number', type: 'number', description: 'Número del cual obtener el logaritmo natural' }
    ], 'number', 'Matemáticas');
    addFunction('Log', 'Logaritmo', [
        { name: 'number', type: 'number', description: 'Número del cual obtener el logaritmo' },
        { name: 'base', type: 'number', description: 'Base del logaritmo', optional: true }
    ], 'number', 'Matemáticas');
    addFunction('Sine', 'Seno', [
        { name: 'angle', type: 'number', description: 'Ángulo en radianes' }
    ], 'number', 'Matemáticas');
    addFunction('Cosine', 'Coseno', [
        { name: 'angle', type: 'number', description: 'Ángulo en radianes' }
    ], 'number', 'Matemáticas');
    addFunction('Tangent', 'Tangente', [
        { name: 'angle', type: 'number', description: 'Ángulo en radianes' }
    ], 'number', 'Matemáticas');
    addFunction('ArcTangent', 'Arco tangente', [
        { name: 'number', type: 'number', description: 'Número del cual obtener el arco tangente' }
    ], 'number', 'Matemáticas');
    // Funciones de manejo de archivos
    addFunction('CheckFileExists', 'Verifica si un archivo existe', [
        { name: 'filePath', type: 'string', description: 'Ruta del archivo a verificar' }
    ], 'boolean', 'Manejo de Archivos');
    addFunction('CheckDirectoryExists', 'Verifica si un directorio existe', [
        { name: 'directoryPath', type: 'string', description: 'Ruta del directorio a verificar' }
    ], 'boolean', 'Manejo de Archivos');
    addFunction('CreateDirectory', 'Crea un directorio', [
        { name: 'directoryPath', type: 'string', description: 'Ruta del directorio a crear' }
    ], 'boolean', 'Manejo de Archivos');
    addFunction('FileCopy', 'Copia un archivo', [
        { name: 'sourcePath', type: 'string', description: 'Ruta del archivo origen' },
        { name: 'destinationPath', type: 'string', description: 'Ruta del archivo destino' }
    ], 'boolean', 'Manejo de Archivos');
    addFunction('FileDelete', 'Elimina un archivo', [
        { name: 'filePath', type: 'string', description: 'Ruta del archivo a eliminar' }
    ], 'boolean', 'Manejo de Archivos');
    // Funciones de comunicación serie
    addFunction('Serial_Open', 'Abre una conexión serie', [
        { name: 'port', type: 'string', description: 'Puerto serie (ej: COM1)' },
        { name: 'baudRate', type: 'number', description: 'Velocidad de baudios' },
        { name: 'dataBits', type: 'number', description: 'Bits de datos', optional: true },
        { name: 'stopBits', type: 'number', description: 'Bits de parada', optional: true },
        { name: 'parity', type: 'string', description: 'Paridad', optional: true }
    ], 'boolean', 'Comunicación Serie');
    addFunction('Serial_Close', 'Cierra una conexión serie', [
        { name: 'port', type: 'string', description: 'Puerto serie a cerrar' }
    ], 'boolean', 'Comunicación Serie');
    addFunction('Serial_Send', 'Envía datos por puerto serie', [
        { name: 'port', type: 'string', description: 'Puerto serie' },
        { name: 'data', type: 'string', description: 'Datos a enviar' }
    ], 'boolean', 'Comunicación Serie');
    addFunction('Serial_Read', 'Lee datos del puerto serie', [
        { name: 'port', type: 'string', description: 'Puerto serie' },
        { name: 'timeout', type: 'number', description: 'Timeout en milisegundos', optional: true }
    ], 'string', 'Comunicación Serie');
    // Funciones de GPIB
    addFunction('GPIB_Open', 'Abre una conexión GPIB', [
        { name: 'address', type: 'number', description: 'Dirección GPIB del dispositivo' }
    ], 'boolean', 'GPIB');
    addFunction('GPIB_Close', 'Cierra una conexión GPIB', [
        { name: 'address', type: 'number', description: 'Dirección GPIB del dispositivo' }
    ], 'boolean', 'GPIB');
    addFunction('GPIB_Write', 'Escribe datos por GPIB', [
        { name: 'address', type: 'number', description: 'Dirección GPIB del dispositivo' },
        { name: 'command', type: 'string', description: 'Comando a enviar' }
    ], 'boolean', 'GPIB');
    addFunction('GPIB_Read', 'Lee datos por GPIB', [
        { name: 'address', type: 'number', description: 'Dirección GPIB del dispositivo' },
        { name: 'timeout', type: 'number', description: 'Timeout en milisegundos', optional: true }
    ], 'string', 'GPIB');
    // Funciones de VISA
    addFunction('VISA_Open', 'Abre una conexión VISA', [
        { name: 'resource', type: 'string', description: 'Recurso VISA (ej: TCPIP0::192.168.1.100::INSTR)' }
    ], 'boolean', 'VISA');
    addFunction('VISA_Close', 'Cierra una conexión VISA', [
        { name: 'resource', type: 'string', description: 'Recurso VISA a cerrar' }
    ], 'boolean', 'VISA');
    addFunction('VISA_Write', 'Escribe datos por VISA', [
        { name: 'resource', type: 'string', description: 'Recurso VISA' },
        { name: 'command', type: 'string', description: 'Comando a enviar' }
    ], 'boolean', 'VISA');
    addFunction('VISA_Read', 'Lee datos por VISA', [
        { name: 'resource', type: 'string', description: 'Recurso VISA' },
        { name: 'timeout', type: 'number', description: 'Timeout en milisegundos', optional: true }
    ], 'string', 'VISA');
    // Funciones de base de datos
    addFunction('SQL_Connect', 'Conecta a una base de datos', [
        { name: 'connectionString', type: 'string', description: 'Cadena de conexión a la base de datos' }
    ], 'boolean', 'Base de Datos');
    addFunction('SQL_Close', 'Cierra la conexión a la base de datos', [], 'boolean', 'Base de Datos');
    addFunction('SQL_Query', 'Ejecuta una consulta SQL', [
        { name: 'query', type: 'string', description: 'Consulta SQL a ejecutar' }
    ], 'any', 'Base de Datos');
    // Funciones de automatización
    addFunction('Automation_GetElementByName', 'Obtiene un elemento de automatización por nombre', [
        { name: 'elementName', type: 'string', description: 'Nombre del elemento' }
    ], 'object', 'Automatización');
    addFunction('Automation_ElementInvoke', 'Invoca una acción en un elemento', [
        { name: 'element', type: 'object', description: 'Elemento de automatización' },
        { name: 'action', type: 'string', description: 'Acción a invocar' }
    ], 'boolean', 'Automatización');
    addFunction('Automation_ElementSetValue', 'Establece el valor de un elemento', [
        { name: 'element', type: 'object', description: 'Elemento de automatización' },
        { name: 'value', type: 'string', description: 'Valor a establecer' }
    ], 'boolean', 'Automatización');
    addFunction('Automation_ElementGetValue', 'Obtiene el valor de un elemento', [
        { name: 'element', type: 'object', description: 'Elemento de automatización' }
    ], 'string', 'Automatización');
    // Funciones de medición
    addFunction('RecordMeasurement', 'Registra una medición', [
        { name: 'measurementName', type: 'string', description: 'Nombre de la medición' },
        { name: 'value', type: 'number', description: 'Valor de la medición' },
        { name: 'unit', type: 'string', description: 'Unidad de la medición', optional: true }
    ], 'void', 'Medición');
    addFunction('RecordMeasurementWithLimits', 'Registra una medición con límites', [
        { name: 'measurementName', type: 'string', description: 'Nombre de la medición' },
        { name: 'value', type: 'number', description: 'Valor de la medición' },
        { name: 'lowerLimit', type: 'number', description: 'Límite inferior' },
        { name: 'upperLimit', type: 'number', description: 'Límite superior' },
        { name: 'unit', type: 'string', description: 'Unidad de la medición', optional: true }
    ], 'boolean', 'Medición');
    // Funciones de operador
    addFunction('OperatorInputPrompt', 'Muestra un prompt de entrada al operador', [
        { name: 'message', type: 'string', description: 'Mensaje a mostrar' },
        { name: 'defaultValue', type: 'string', description: 'Valor por defecto', optional: true }
    ], 'string', 'Operador');
    addFunction('OperatorPicturePrompt', 'Muestra un prompt con imagen al operador', [
        { name: 'message', type: 'string', description: 'Mensaje a mostrar' },
        { name: 'imagePath', type: 'string', description: 'Ruta de la imagen' }
    ], 'string', 'Operador');
    addFunction('OperatorPrompt', 'Muestra un prompt simple al operador', [
        { name: 'message', type: 'string', description: 'Mensaje a mostrar' }
    ], 'void', 'Operador');
    // Funciones de utilidad
    addFunction('Sleep', 'Pausa la ejecución', [
        { name: 'milliseconds', type: 'number', description: 'Tiempo en milisegundos' }
    ], 'void', 'Utilidad');
    addFunction('SleepMicroseconds', 'Pausa la ejecución en microsegundos', [
        { name: 'microseconds', type: 'number', description: 'Tiempo en microsegundos' }
    ], 'void', 'Utilidad');
    addFunction('SleepMilliseconds', 'Pausa la ejecución en milisegundos', [
        { name: 'milliseconds', type: 'number', description: 'Tiempo en milisegundos' }
    ], 'void', 'Utilidad');
    addFunction('GetSystemTime', 'Obtiene la hora del sistema', [], 'string', 'Utilidad');
    addFunction('GetCurrentDirectory', 'Obtiene el directorio actual', [], 'string', 'Utilidad');
    addFunction('Log', 'Registra un mensaje en el log', [
        { name: 'message', type: 'string', description: 'Mensaje a registrar' },
        { name: 'level', type: 'string', description: 'Nivel del log (INFO, WARN, ERROR)', optional: true }
    ], 'void', 'Utilidad');
    // Funciones específicas de JabilTest
    addFunction('SetCellViewMode', 'Establece el modo de vista de la celda', [
        { name: 'mode', type: 'string', description: 'Modo de vista (STATUS, BROWSER, etc.)' }
    ], 'void', 'JabilTest');
    addFunction('SetCellLabel', 'Establece la etiqueta de la celda', [
        { name: 'label', type: 'string', description: 'Texto de la etiqueta' }
    ], 'void', 'JabilTest');
    addFunction('SetDebugVerbosityLevel', 'Establece el nivel de verbosidad del debug', [
        { name: 'level', type: 'string', description: 'Nivel (None, Verbose, etc.)' }
    ], 'void', 'JabilTest');
    addFunction('UpdateProgressBar', 'Actualiza la barra de progreso', [
        { name: 'percentage', type: 'number', description: 'Porcentaje de progreso (0-100)' }
    ], 'void', 'JabilTest');
    addFunction('UpdateStatus', 'Actualiza el estado mostrado', [
        { name: 'message', type: 'string', description: 'Mensaje de estado' }
    ], 'void', 'JabilTest');
    addFunction('GetDisplaySize', 'Obtiene el tamaño de la pantalla', [
        { name: 'displayIndex', type: 'number', description: 'Índice del display' }
    ], 'array', 'JabilTest');
    addFunction('Round', 'Redondea un número', [
        { name: 'number', type: 'number', description: 'Número a redondear' },
        { name: 'decimals', type: 'number', description: 'Número de decimales', optional: true }
    ], 'number', 'Matemáticas');
    addFunction('Floor', 'Redondea hacia abajo', [
        { name: 'number', type: 'number', description: 'Número a redondear' }
    ], 'number', 'Matemáticas');
    addFunction('StringCat', 'Concatena cadenas', [
        { name: 'string1', type: 'string', description: 'Primera cadena' },
        { name: 'string2', type: 'string', description: 'Segunda cadena' }
    ], 'string', 'Cadenas');
    addFunction('StringToUpper', 'Convierte cadena a mayúsculas', [
        { name: 'string', type: 'string', description: 'Cadena a convertir' }
    ], 'string', 'Cadenas');
    addFunction('StringLength', 'Obtiene la longitud de una cadena', [
        { name: 'string', type: 'string', description: 'Cadena a medir' }
    ], 'number', 'Cadenas');
    addFunction('StringStartsWith', 'Verifica si una cadena comienza con otra', [
        { name: 'string', type: 'string', description: 'Cadena principal' },
        { name: 'prefix', type: 'string', description: 'Prefijo a buscar' },
        { name: 'caseSensitive', type: 'boolean', description: 'Sensible a mayúsculas', optional: true }
    ], 'boolean', 'Cadenas');
    addFunction('StringSub', 'Extrae una subcadena', [
        { name: 'string', type: 'string', description: 'Cadena principal' },
        { name: 'start', type: 'number', description: 'Posición inicial' },
        { name: 'length', type: 'number', description: 'Longitud a extraer' }
    ], 'string', 'Cadenas');
    addFunction('StringParseToFloat', 'Convierte cadena a número flotante', [
        { name: 'string', type: 'string', description: 'Cadena a convertir' }
    ], 'number', 'Cadenas');
    addFunction('StringTrim', 'Elimina espacios al inicio y final', [
        { name: 'string', type: 'string', description: 'Cadena a limpiar' }
    ], 'string', 'Cadenas');
    addFunction('ShowImage', 'Muestra una imagen', [
        { name: 'imagePath', type: 'string', description: 'Ruta de la imagen' },
        { name: 'width', type: 'number', description: 'Ancho de la imagen' },
        { name: 'height', type: 'number', description: 'Alto de la imagen' }
    ], 'handle', 'JabilTest');
    addFunction('HideImage', 'Oculta una imagen', [
        { name: 'handle', type: 'handle', description: 'Handle de la imagen' }
    ], 'void', 'JabilTest');
    addFunction('RecordMeasurement', 'Registra una medición', [
        { name: 'name', type: 'string', description: 'Nombre de la medición' },
        { name: 'value', type: 'number', description: 'Valor medido' },
        { name: 'unit', type: 'string', description: 'Unidad de medida' },
        { name: 'fail', type: 'boolean', description: 'Indica si es falla', optional: true }
    ], 'void', 'Medición');
    addFunction('RecordMeasurementPassFail', 'Registra medición con resultado Pass/Fail', [
        { name: 'name', type: 'string', description: 'Nombre de la medición' },
        { name: 'value', type: 'any', description: 'Valor medido' },
        { name: 'unit', type: 'string', description: 'Unidad de medida' },
        { name: 'hasLimits', type: 'boolean', description: 'Tiene límites' },
        { name: 'passed', type: 'boolean', description: 'Pasó la prueba' }
    ], 'void', 'Medición');
    addFunction('OperatorPicturePromptSpecifyOptionsWithPosition', 'Prompt con imagen y opciones en posición específica', [
        { name: 'title', type: 'string', description: 'Título del prompt' },
        { name: 'imagePath', type: 'string', description: 'Ruta de la imagen' },
        { name: 'stretch', type: 'string', description: 'Modo de estiramiento' },
        { name: 'width', type: 'number', description: 'Ancho' },
        { name: 'height', type: 'number', description: 'Alto' },
        { name: 'options', type: 'string', description: 'Opciones separadas por punto y coma' },
        { name: 'x', type: 'number', description: 'Posición X' },
        { name: 'y', type: 'number', description: 'Posición Y' }
    ], 'string', 'Operador');
    addFunction('OperatorPromptNonBlocking', 'Prompt no bloqueante', [
        { name: 'message', type: 'string', description: 'Mensaje a mostrar' },
        { name: 'timeout', type: 'number', description: 'Timeout en segundos' },
        { name: 'height', type: 'number', description: 'Alto de la ventana', optional: true }
    ], 'handle', 'Operador');
    addFunction('CloseForm', 'Cierra un formulario', [
        { name: 'handle', type: 'handle', description: 'Handle del formulario' }
    ], 'void', 'JabilTest');
    addFunction('SetExtendedPanelMode', 'Establece el modo del panel extendido', [
        { name: 'mode', type: 'string', description: 'Modo del panel (NONE, etc.)' }
    ], 'void', 'JabilTest');
    addFunction('SetCellColor', 'Establece el color de la celda', [
        { name: 'red1', type: 'number', description: 'Componente rojo 1' },
        { name: 'green1', type: 'number', description: 'Componente verde 1' },
        { name: 'blue1', type: 'number', description: 'Componente azul 1' },
        { name: 'red2', type: 'number', description: 'Componente rojo 2' },
        { name: 'green2', type: 'number', description: 'Componente verde 2' },
        { name: 'blue2', type: 'number', description: 'Componente azul 2' },
        { name: 'angle', type: 'number', description: 'Ángulo del gradiente' }
    ], 'void', 'JabilTest');
    addFunction('MESReportWriter_ConfigureLocations', 'Configura ubicaciones del reporte MES', [
        { name: 'location1', type: 'string', description: 'Ubicación principal' },
        { name: 'location2', type: 'string', description: 'Ubicación secundaria' },
        { name: 'enabled', type: 'boolean', description: 'Habilitado' }
    ], 'void', 'Reportes');
    addFunction('HtmlReportWriter_ConfigureLocations', 'Configura ubicaciones del reporte HTML', [
        { name: 'location1', type: 'string', description: 'Ubicación principal' },
        { name: 'location2', type: 'string', description: 'Ubicación secundaria' },
        { name: 'enabled', type: 'boolean', description: 'Habilitado' }
    ], 'void', 'Reportes');
    addFunction('ConfigureReporting', 'Configura el reporte', [
        { name: 'reporter', type: 'string', description: 'Tipo de reporte' },
        { name: 'enabled', type: 'boolean', description: 'Habilitado' }
    ], 'void', 'Reportes');
    // Funciones de variables y tipos
    addFunction('New', 'Crea una nueva variable', [
        { name: 'type', type: 'string', description: 'Tipo de variable (Integer, String, etc.)' },
        { name: 'value', type: 'any', description: 'Valor inicial' }
    ], 'any', 'Variables');
    // Funciones de sistema
    addFunction('SystemTime', 'Obtiene la hora del sistema', [], 'array', 'Sistema');
    addFunction('EnterCS', 'Entra en sección crítica', [
        { name: 'name', type: 'string', description: 'Nombre de la sección crítica' }
    ], 'void', 'Sistema');
    addFunction('ExitCS', 'Sale de sección crítica', [
        { name: 'name', type: 'string', description: 'Nombre de la sección crítica' }
    ], 'void', 'Sistema');
    addFunction('DeletePersistentVariable', 'Elimina variable persistente', [
        { name: 'scope', type: 'string', description: 'Ámbito de la variable' },
        { name: 'name', type: 'string', description: 'Nombre de la variable' }
    ], 'void', 'Variables');
    // Funciones específicas de JabilTest que faltaban
    addFunction('TorqueLoadExcel', 'Carga datos de torque desde archivo Excel', [
        { name: 'filePath', type: 'string', description: 'Ruta del archivo Excel' }
    ], 'array', 'JabilTest');
    addFunction('TorqueGetStepInfo', 'Obtiene información de un paso de torque', [
        { name: 'stepNumber', type: 'number', description: 'Número del paso' },
        { name: 'stepDataList', type: 'array', description: 'Lista de datos de pasos' }
    ], 'array', 'JabilTest');
    addFunction('Serial_SendMilliseconds', 'Envía comando por puerto serie con timeout', [
        { name: 'port', type: 'number', description: 'Puerto serie' },
        { name: 'command', type: 'string', description: 'Comando a enviar' },
        { name: 'terminator', type: 'string', description: 'Terminador de línea' },
        { name: 'timeout', type: 'number', description: 'Timeout en milisegundos' }
    ], 'string', 'Comunicación Serie');
    addFunction('OperatorPicturePromptSpecifyOptionsWithPosition', 'Prompt con imagen y opciones en posición específica', [
        { name: 'title', type: 'string', description: 'Título del prompt' },
        { name: 'imagePath', type: 'string', description: 'Ruta de la imagen' },
        { name: 'stretch', type: 'string', description: 'Modo de estiramiento' },
        { name: 'width', type: 'number', description: 'Ancho' },
        { name: 'height', type: 'number', description: 'Alto' },
        { name: 'options', type: 'string', description: 'Opciones separadas por punto y coma' },
        { name: 'x', type: 'number', description: 'Posición X' },
        { name: 'y', type: 'number', description: 'Posición Y' }
    ], 'string', 'Operador');
    addFunction('OperatorPromptNonBlocking', 'Prompt no bloqueante', [
        { name: 'message', type: 'string', description: 'Mensaje a mostrar' },
        { name: 'timeout', type: 'number', description: 'Timeout en segundos' },
        { name: 'height', type: 'number', description: 'Alto de la ventana', optional: true }
    ], 'handle', 'Operador');
    addFunction('CloseForm', 'Cierra un formulario', [
        { name: 'handle', type: 'handle', description: 'Handle del formulario' }
    ], 'void', 'JabilTest');
    addFunction('Sleep', 'Pausa la ejecución en segundos', [
        { name: 'seconds', type: 'number', description: 'Tiempo en segundos' }
    ], 'void', 'Utilidad');
}
function addFunction(name, description, parameters, returnType = 'void', category = 'General') {
    standardFunctions.set(name, {
        name,
        description,
        parameters,
        returnType,
        category
    });
}
// Inicializar funciones estándar
initializeStandardFunctions();
// Manejar notificaciones de inicialización
connection.onInitialize((params) => {
    const capabilities = params.capabilities;
    // Verificar capacidades del cliente
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            // Capacidades de autocompletado
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.', '(']
            },
            // Capacidades de información de hover
            hoverProvider: true,
            // Capacidades de ayuda de firma
            signatureHelpProvider: {
                triggerCharacters: ['(', ',']
            },
            // Capacidades de definición
            definitionProvider: true,
            // Capacidades de diagnóstico
            diagnosticProvider: {
                interFileDependencies: true,
                workspaceDiagnostics: true
            }
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});
// Manejar notificaciones de inicialización completada
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Registrar para notificaciones de cambio de configuración
        connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});
// Manejar cambios de configuración
connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Limpiar cache de configuración de documentos
        documentSettings.clear();
    }
    else {
        globalSettings = ((change.settings.silktestLanguageServer || defaultSettings));
    }
    // Revalidar todos los documentos abiertos
    documents.all().forEach(validateTextDocument);
});
// Obtener configuración del documento
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'silktestLanguageServer'
        });
        documentSettings.set(resource, result);
    }
    return result;
}
// Manejar cambios en documentos
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});
// Validar documento
async function validateTextDocument(textDocument) {
    const settings = await getDocumentSettings(textDocument.uri);
    const text = textDocument.getText();
    const diagnostics = [];
    // Verificar límite de problemas
    let problems = 0;
    const maxProblems = settings.maxNumberOfProblems;
    // Patrones de validación
    const lines = text.split(/\r?\n/g);
    for (let i = 0; i < lines.length && problems < maxProblems; i++) {
        const line = lines[i];
        const lineNumber = i;
        // Verificar sintaxis básica
        if (settings.enableErrorChecking) {
            // Verificar paréntesis balanceados
            const openParens = (line.match(/\(/g) || []).length;
            const closeParens = (line.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
                const diagnostic = {
                    severity: node_1.DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: 0 },
                        end: { line: lineNumber, character: line.length }
                    },
                    message: 'Paréntesis no balanceados',
                    source: 'JabilTest'
                };
                diagnostics.push(diagnostic);
                problems++;
            }
            // Verificar funciones no reconocidas
            const functionCalls = line.match(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g);
            if (functionCalls) {
                for (const call of functionCalls) {
                    const functionName = call.replace(/\s*\($/, '');
                    if (!standardFunctions.has(functionName) &&
                        !['if', 'while', 'for', 'function', 'call', 'End', 'goto', 'return', 'break', 'continue'].includes(functionName)) {
                        const diagnostic = {
                            severity: node_1.DiagnosticSeverity.Warning,
                            range: {
                                start: { line: lineNumber, character: line.indexOf(call) },
                                end: { line: lineNumber, character: line.indexOf(call) + functionName.length }
                            },
                            message: `Función no reconocida: ${functionName}`,
                            source: 'JabilTest'
                        };
                        diagnostics.push(diagnostic);
                        problems++;
                    }
                }
            }
            // Verificar sintaxis de strings
            const stringMatches = line.match(/"[^"]*$/g);
            if (stringMatches) {
                const diagnostic = {
                    severity: node_1.DiagnosticSeverity.Error,
                    range: {
                        start: { line: lineNumber, character: line.lastIndexOf('"') },
                        end: { line: lineNumber, character: line.length }
                    },
                    message: 'String no cerrado',
                    source: 'JabilTest'
                };
                diagnostics.push(diagnostic);
                problems++;
            }
        }
    }
    // Enviar diagnósticos
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
// Manejar solicitudes de autocompletado
connection.onCompletion((_textDocumentPosition) => {
    const completions = [];
    // Agregar funciones estándar
    for (const [name, funcInfo] of standardFunctions) {
        const completion = {
            label: name,
            kind: node_1.CompletionItemKind.Function,
            detail: funcInfo.description,
            documentation: {
                kind: node_1.MarkupKind.Markdown,
                value: `**${name}**\n\n${funcInfo.description}\n\n**Parámetros:**\n${funcInfo.parameters.map(p => `- ${p.name} (${p.type}): ${p.description}`).join('\n')}\n\n**Retorna:** ${funcInfo.returnType}\n\n**Categoría:** ${funcInfo.category}`
            },
            insertText: name + '('
        };
        completions.push(completion);
    }
    // Agregar palabras clave
    const keywords = [
        'true', 'false', 'null', 'new', 'this',
        'if', 'else', 'while', 'for', 'function',
        'return', 'break', 'continue', 'goto',
        'call', 'End', 'Label', 'ScriptIf'
    ];
    for (const keyword of keywords) {
        const completion = {
            label: keyword,
            kind: node_1.CompletionItemKind.Keyword,
            detail: 'Palabra clave',
            insertText: keyword
        };
        completions.push(completion);
    }
    return completions;
});
// Manejar resolución de elementos de autocompletado
connection.onCompletionResolve((item) => {
    if (item.kind === node_1.CompletionItemKind.Function) {
        const funcInfo = standardFunctions.get(item.label);
        if (funcInfo) {
            item.detail = funcInfo.description;
            item.documentation = {
                kind: node_1.MarkupKind.Markdown,
                value: `**${funcInfo.name}**\n\n${funcInfo.description}\n\n**Parámetros:**\n${funcInfo.parameters.map(p => `- ${p.name} (${p.type}): ${p.description}`).join('\n')}\n\n**Retorna:** ${funcInfo.returnType}\n\n**Categoría:** ${funcInfo.category}`
            };
        }
    }
    return item;
});
// Función auxiliar para obtener el rango de una palabra
function getWordRangeAtPosition(document, position) {
    const text = document.getText();
    const lines = text.split(/\r?\n/g);
    const line = lines[position.line];
    if (!line) {
        return null;
    }
    let start = position.character;
    let end = position.character;
    // Buscar inicio de la palabra
    while (start > 0 && /[A-Za-z0-9_]/.test(line[start - 1])) {
        start--;
    }
    // Buscar final de la palabra
    while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) {
        end++;
    }
    if (start === end) {
        return null;
    }
    return {
        start: { line: position.line, character: start },
        end: { line: position.line, character: end }
    };
}
// Manejar solicitudes de hover
connection.onHover((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    const position = params.position;
    const range = getWordRangeAtPosition(document, position);
    if (!range) {
        return null;
    }
    const word = document.getText(range);
    const funcInfo = standardFunctions.get(word);
    if (funcInfo) {
        const contents = {
            kind: node_1.MarkupKind.Markdown,
            value: `**${funcInfo.name}**\n\n${funcInfo.description}\n\n**Parámetros:**\n${funcInfo.parameters.map(p => `- ${p.name} (${p.type}): ${p.description}`).join('\n')}\n\n**Retorna:** ${funcInfo.returnType}\n\n**Categoría:** ${funcInfo.category}`
        };
        return { contents, range };
    }
    return null;
});
// Manejar solicitudes de ayuda de firma
connection.onSignatureHelp((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    const position = params.position;
    const lineText = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character }
    });
    // Buscar llamada de función
    const functionMatch = lineText.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*$/);
    if (!functionMatch) {
        return null;
    }
    const functionName = functionMatch[1];
    const funcInfo = standardFunctions.get(functionName);
    if (!funcInfo) {
        return null;
    }
    // Contar parámetros
    const paramText = functionMatch[0].substring(functionMatch[0].indexOf('(') + 1);
    const paramCount = (paramText.match(/,/g) || []).length;
    const signature = {
        label: `${functionName}(${funcInfo.parameters.map(p => `${p.type} ${p.name}`).join(', ')})`,
        documentation: funcInfo.description,
        parameters: funcInfo.parameters.map(p => ({
            label: p.name,
            documentation: p.description
        }))
    };
    return {
        signatures: [signature],
        activeSignature: 0,
        activeParameter: Math.min(paramCount, funcInfo.parameters.length - 1)
    };
});
// Manejar solicitudes de definición
connection.onDefinition((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    const position = params.position;
    const range = getWordRangeAtPosition(document, position);
    if (!range) {
        return null;
    }
    const word = document.getText(range);
    const funcInfo = standardFunctions.get(word);
    if (funcInfo) {
        // Para funciones estándar, retornar la posición actual (ya que son funciones del sistema)
        return {
            uri: params.textDocument.uri,
            range: range
        };
    }
    return null;
});
// Manejar notificaciones personalizadas
connection.onNotification('dll/registered', (params) => {
    connection.console.log(`DLL registrada: ${params.dllName} en ${params.dllPath}`);
    // Aquí podrías cargar las funciones de la DLL y agregarlas al mapa de funciones
});
connection.onNotification('dll/unregistered', (params) => {
    connection.console.log(`DLL desregistrada: ${params.dllName}`);
    // Aquí podrías remover las funciones de la DLL del mapa de funciones
});
// Hacer que el cliente de documentos escuche las conexiones
documents.listen(connection);
// Escuchar en la conexión
connection.listen();
//# sourceMappingURL=server.js.map