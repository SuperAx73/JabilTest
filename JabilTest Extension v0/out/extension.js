"use strict";
/**
 * Extensión principal para soporte de lenguaje JabilTest
 * Autor: Axiel Urenda
 * Descripción: Proporciona soporte completo para el lenguaje JabilTest
 * incluyendo corrección de errores, autocompletado y registro de DLLs
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.DLLManager = void 0;
const vscode = __importStar(require("vscode"));
const node_1 = require("vscode-languageclient/node");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let client;
let dllManager;
class DLLManager {
    constructor() {
        this.registeredDLLs = new Map();
        this.config = vscode.workspace.getConfiguration('jabiltest');
        this.loadRegisteredDLLs();
    }
    /**
     * Registra una DLL para ser reconocida por el sistema
     */
    async registerDLL(dllPath) {
        try {
            if (!fs.existsSync(dllPath)) {
                vscode.window.showErrorMessage(`La DLL no existe en la ruta: ${dllPath}`);
                return false;
            }
            const dllName = path.basename(dllPath);
            this.registeredDLLs.set(dllName, dllPath);
            // Guardar configuración
            await this.saveRegisteredDLLs();
            // Notificar al servidor de lenguaje
            if (client) {
                await client.sendNotification('dll/registered', { dllPath, dllName });
            }
            vscode.window.showInformationMessage(`DLL registrada exitosamente: ${dllName}`);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error al registrar DLL: ${error}`);
            return false;
        }
    }
    /**
     * Desregistra una DLL
     */
    async unregisterDLL(dllName) {
        try {
            if (this.registeredDLLs.has(dllName)) {
                this.registeredDLLs.delete(dllName);
                await this.saveRegisteredDLLs();
                // Notificar al servidor de lenguaje
                if (client) {
                    await client.sendNotification('dll/unregistered', { dllName });
                }
                vscode.window.showInformationMessage(`DLL desregistrada: ${dllName}`);
                return true;
            }
            return false;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error al desregistrar DLL: ${error}`);
            return false;
        }
    }
    /**
     * Lista todas las DLLs registradas
     */
    listRegisteredDLLs() {
        const dlls = [];
        this.registeredDLLs.forEach((path, name) => {
            dlls.push({ name, path });
        });
        return dlls;
    }
    /**
     * Busca funciones disponibles en las DLLs registradas
     */
    async getAvailableFunctions() {
        const functions = [];
        // Cargar funciones estándar de SilkTest/4Test
        const standardFunctions = this.getStandardFunctions();
        functions.push(...standardFunctions);
        // Agregar funciones de DLLs registradas
        for (const [dllName, dllPath] of this.registeredDLLs) {
            try {
                const dllFunctions = await this.extractFunctionsFromDLL(dllPath);
                functions.push(...dllFunctions);
            }
            catch (error) {
                console.warn(`Error al extraer funciones de ${dllName}: ${error}`);
            }
        }
        return functions;
    }
    /**
     * Extrae funciones de una DLL (implementación básica)
     */
    async extractFunctionsFromDLL(dllPath) {
        // Esta es una implementación simplificada
        // En un entorno real, necesitarías usar herramientas como dumpbin, objdump, o librerías específicas
        const functions = [];
        try {
            // Por ahora, retornamos funciones conocidas basadas en el nombre del archivo
            const dllName = path.basename(dllPath, '.dll').toLowerCase();
            // Simulación de extracción de funciones basada en patrones conocidos
            if (dllName.includes('serial')) {
                functions.push('Serial_Open', 'Serial_Close', 'Serial_Send', 'Serial_Read');
            }
            if (dllName.includes('gpib')) {
                functions.push('GPIB_Open', 'GPIB_Close', 'GPIB_Write', 'GPIB_Read');
            }
            if (dllName.includes('visa')) {
                functions.push('VISA_Open', 'VISA_Close', 'VISA_Write', 'VISA_Read');
            }
        }
        catch (error) {
            console.warn(`Error al extraer funciones de ${dllPath}: ${error}`);
        }
        return functions;
    }
    /**
     * Obtiene las funciones estándar de SilkTest/4Test
     */
    getStandardFunctions() {
        return [
            'call', 'End', 'function', 'goto', 'return',
            'SetFinalizeFunction', 'SetFailFunction', 'SetAbortFunction',
            'SetTestName', 'SetTestGroupName', 'SetProductName',
            'EnterCS', 'ExitCS', 'Label', 'ScriptIf', 'New',
            'true', 'false', 'while', 'continue', 'break', 'if',
            'AA_Adaptor_Get_PortID_By_SN', 'AA_Adaptor_I2C_BitRate_Set',
            'AA_Adaptor_I2C_Host_Read', 'AA_Adaptor_I2C_Host_Write',
            'Abort', 'AbortAllTests', 'AbortTestCell', 'Abs', 'Add',
            'AddToCRC', 'AES128CBC_DecryptByteArrayToByteArray',
            'Array1DContains', 'Array1DConvert', 'Array1DCreate',
            'AuthenticateOperatorByPassword', 'Automation_CheckElementExistsByAutomationId',
            'BrowserInvokeScript', 'BrowserPlayVideo', 'BrowserRefresh',
            'CheckDirectoryExists', 'CheckDriveWriteProtected', 'CheckFileExists',
            'Clipboard_GetText', 'Clipboard_SetText', 'CloseForm',
            'CMD_Close', 'CMD_OpenCMDProcess', 'CMD_ReadCompleteStdOut',
            'DataTable_AddColumn', 'DataTable_AddRow', 'DataTable_Create',
            'DateAddTime', 'DateParse', 'DateParseISO',
            'Dictionary_CheckKeyExists', 'Dictionary_Create', 'Dictionary_GetAllKeys',
            'DirectoryCopy', 'DirectoryDelete', 'DisableAbort', 'DisableLogging',
            'Divide', 'EnableAbort', 'EnableLogging', 'EnforceValidation',
            'FileBinaryWriteByte', 'FileBinaryWriteByteArray', 'FileBinaryWriteClose',
            'GetCurrentDirectory', 'GetDateTimeDifference', 'GetDebugVerbosityLevel',
            'HTTP_Request', 'HTTP_RequestBool', 'HTTP_SetSecurityProtocol',
            'IntegerToBinaryStringSpecifyWidth', 'IntegerToHexString', 'IsEqual',
            'Log', 'Logical_AND', 'Logical_OR', 'LogSpecifyBase',
            'Mod', 'ModbusTCP_Close', 'ModbusTCP_Init', 'ModbusTCP_ReadCoilStatus',
            'Multiply', 'NaturalLog', 'New', 'OperatorCountDownNonBlocking',
            'OperatorInputCheckedListPrompt', 'OperatorInputComboBox',
            'Power', 'ProcessWindowControlByHandle', 'ProcessWindowControlByName',
            'ReadAllLinesFromProcessStdError', 'ReadAllLinesFromProcessStdOut',
            'RecordMeasurement', 'RecordMeasurement_GetMeasurementTime',
            'RegistryCheckKeyExists', 'RegistryCreateSubKey', 'RegistryDeleteSubKey',
            'ResetElapsedTime', 'Round', 'SafelyRemoveDriveByLetter',
            'SaveScreenCaptureToFile', 'SendEmail', 'SendEmailWithAttachment',
            'Serial_ChangeEncoding', 'Serial_Close', 'Serial_CloseWithLogging',
            'SetAbortFunction', 'SetAutomationCell', 'SetCellColor', 'SetCellLabel',
            'ShowDelayPicture', 'ShowDelayPictureWithLocation', 'ShowImage',
            'Sleep', 'SleepMicroseconds', 'SleepMilliseconds', 'SplitWaveFile',
            'SQL_Close', 'SQL_Connect', 'SQL_ConnectAsWinUser', 'SQL_Query',
            'SquareRoot', 'StartProcess', 'StartProcessCaptureAllStandardErrorUntilExit',
            'StartTestCell', 'StartTestCellWithSerialNumber', 'StopSoundFile',
            'String_Base64Decode', 'String_Base64Encode', 'StringCat', 'StringCheckMask',
            'Subtract', 'SwapBytesOrWords', 'SystemCall', 'SystemTime', 'Tangent',
            'TelnetClose', 'TelnetConnect', 'TelnetConnectBool', 'TelnetFlush',
            'UpdateProgressBar', 'UpdateStatus', 'USB_CheckDeviceExists',
            'WaitEventCreate', 'WaitEventDestroy', 'WaitEventHold', 'WaitEventRelease',
            'WriteIniFile', 'WriteLineToProcessStdIn', 'XmlReadConfig'
        ];
    }
    /**
     * Carga las DLLs registradas desde la configuración
     */
    loadRegisteredDLLs() {
        try {
            const dllPaths = this.config.get('registeredDLLs') || [];
            for (const dllPath of dllPaths) {
                const dllName = path.basename(dllPath);
                this.registeredDLLs.set(dllName, dllPath);
            }
        }
        catch (error) {
            console.warn('Error al cargar DLLs registradas:', error);
        }
    }
    /**
     * Guarda las DLLs registradas en la configuración
     */
    async saveRegisteredDLLs() {
        try {
            const dllPaths = Array.from(this.registeredDLLs.values());
            await this.config.update('registeredDLLs', dllPaths, vscode.ConfigurationTarget.Global);
        }
        catch (error) {
            console.warn('Error al guardar DLLs registradas:', error);
        }
    }
}
exports.DLLManager = DLLManager;
/**
 * Función de activación de la extensión
 */
async function activate(context) {
    console.log('Activando extensión JabilTest Language Support');
    // Inicializar el administrador de DLLs
    dllManager = new DLLManager();
    // Configurar el servidor de lenguaje
    const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions }
    };
    const clientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'jabiltest' },
            { scheme: 'file', pattern: '**/*.t' },
            { scheme: 'file', pattern: '**/*.inc' },
            { scheme: 'file', pattern: '**/*.pln' },
            { scheme: 'file', pattern: '**/*.silk' },
            { scheme: 'file', pattern: '**/*.jts' }
        ],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    client = new node_1.LanguageClient('jabiltestLanguageServer', 'JabilTest Language Server', serverOptions, clientOptions);
    // Registrar comandos
    const registerDLLCommand = vscode.commands.registerCommand('jabiltest.registerDLL', async () => {
        const dllPath = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            filters: {
                'DLL Files': ['dll'],
                'All Files': ['*']
            }
        });
        if (dllPath && dllPath.length > 0) {
            await dllManager.registerDLL(dllPath[0].fsPath);
        }
    });
    const unregisterDLLCommand = vscode.commands.registerCommand('jabiltest.unregisterDLL', async () => {
        const dlls = dllManager.listRegisteredDLLs();
        if (dlls.length === 0) {
            vscode.window.showInformationMessage('No hay DLLs registradas');
            return;
        }
        const dllNames = dlls.map(dll => dll.name);
        const selectedDll = await vscode.window.showQuickPick(dllNames, {
            placeHolder: 'Selecciona la DLL a desregistrar'
        });
        if (selectedDll) {
            await dllManager.unregisterDLL(selectedDll);
        }
    });
    const listDLLsCommand = vscode.commands.registerCommand('jabiltest.listRegisteredDLLs', () => {
        const dlls = dllManager.listRegisteredDLLs();
        if (dlls.length === 0) {
            vscode.window.showInformationMessage('No hay DLLs registradas');
            return;
        }
        const dllList = dlls.map(dll => `${dll.name} - ${dll.path}`).join('\n');
        vscode.window.showInformationMessage(`DLLs Registradas:\n${dllList}`);
    });
    const configureLanguageCommand = vscode.commands.registerCommand('jabiltest.configureLanguage', async () => {
        const languagePath = await vscode.window.showInputBox({
            prompt: 'Ingresa la ruta de instalación de JabilTest',
            placeHolder: 'C:\\Program Files\\Jabil\\JabilTest',
            value: vscode.workspace.getConfiguration('jabiltest').get('languagePath') || ''
        });
        if (languagePath) {
            await vscode.workspace.getConfiguration('jabiltest').update('languagePath', languagePath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Ruta del lenguaje configurada: ${languagePath}`);
        }
    });
    // Registrar comandos en el contexto
    context.subscriptions.push(registerDLLCommand, unregisterDLLCommand, listDLLsCommand, configureLanguageCommand);
    // Iniciar el cliente
    await client.start();
    // Configurar el servidor con las DLLs registradas
    const availableFunctions = await dllManager.getAvailableFunctions();
    await client.sendNotification('initialize', {
        functions: availableFunctions,
        dlls: dllManager.listRegisteredDLLs()
    });
    console.log('Extensión JabilTest Language Support activada exitosamente');
}
exports.activate = activate;
/**
 * Función de desactivación de la extensión
 */
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map