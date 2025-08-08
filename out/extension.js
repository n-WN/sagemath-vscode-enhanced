"use strict";
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs")); // 引入文件系统模块
function activate(context) {
    let disposable = vscode.commands.registerCommand('runsagemathfile.run', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No editor is active');
            return;
        }
        const document = editor.document;
        if (document.languageId !== 'sage') {
            vscode.window.showInformationMessage('The active file is not a SageMath file');
            return;
        }
        const sagePath = vscode.workspace.getConfiguration().get('sagemathEnhanced.interpreterPath');
        const commandArgs = vscode.workspace.getConfiguration().get('sagemathEnhanced.commandArguments');
        const filePath = document.fileName;
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const pyFilePath = path.join(fileDir, fileName + '.py');
        const autoDelete = vscode.workspace.getConfiguration().get('sagemathEnhanced.autoDeleteGeneratedFile');
        // 检查 .sage.py 文件在执行前是否存在
        const fileExistsBeforeRun = fs.existsSync(pyFilePath);
        let terminal = vscode.window.terminals.find(t => t.name === 'SageMath');
        if (!terminal) {
            terminal = vscode.window.createTerminal('SageMath');
        }
        terminal.show();
        let command;
        const baseCommand = commandArgs ? `${sagePath} ${commandArgs}` : sagePath;
        if (process.platform === 'win32' && vscode.workspace.getConfiguration().get('sagemathEnhanced.useWSL')) {
            command = `cd "${fileDir}" && wsl ${baseCommand} "${fileName}"`; // 临时方案, 似乎并不能唤起远程, 仅在vscode ssh到wsl时可用
        }
        else if (process.platform === 'win32') {
            command = `cd "${fileDir.replace(/\//g, '\\')}" && ${baseCommand} "${fileName}"`;
        }
        else {
            command = `cd "${fileDir}" && ${baseCommand} "${fileName}"`;
        }
        // 如果启用了自动删除，并且在执行前文件不存在，则附加删除命令
        if (autoDelete && !fileExistsBeforeRun) {
            const deleteCommand = process.platform === 'win32' ? `del "${pyFilePath}"` : `rm "${pyFilePath}"`;
            command += ` && ${deleteCommand}`;
        }
        // For win32, wrapped by `cmd /c`, because PowerShell 5.1 has no && operator
        if (process.platform === 'win32') {
            command = `cmd /c "${command.replaceAll('"', '""')}"`;
        }
        // 作为单一命令执行
        terminal.sendText(command);
    });
    let troubleshootDisposable = vscode.commands.registerCommand('runsagemathfile.troubleshoot', async () => {
        const currentArgs = vscode.workspace.getConfiguration().get('sagemathEnhanced.commandArguments');
        const options = [
            {
                label: '$(bug) Fix pwntools/curses compatibility issues',
                detail: 'Add "-python" flag to bypass SageMath environment initialization',
                action: '-python'
            },
            {
                label: '$(gear) Custom command arguments',
                detail: 'Manually specify command arguments',
                action: 'custom'
            },
            {
                label: '$(info) View current configuration',
                detail: `Current arguments: ${currentArgs || '(none)'}`,
                action: 'view'
            }
        ];
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select a troubleshooting option',
            matchOnDetail: true
        });
        if (!selected) {
            return;
        }
        switch (selected.action) {
            case '-python':
                await vscode.workspace.getConfiguration().update('sagemathEnhanced.commandArguments', '-python', vscode.ConfigurationTarget.Workspace);
                vscode.window.showInformationMessage('Updated command arguments to "-python". This should fix pwntools/curses compatibility issues.');
                break;
            case 'custom':
                const customArgs = await vscode.window.showInputBox({
                    prompt: 'Enter custom command arguments for SageMath',
                    value: currentArgs,
                    placeHolder: 'e.g., -python, --verbose, etc.'
                });
                if (customArgs !== undefined) {
                    await vscode.workspace.getConfiguration().update('sagemathEnhanced.commandArguments', customArgs, vscode.ConfigurationTarget.Workspace);
                    vscode.window.showInformationMessage(`Updated command arguments to "${customArgs}"`);
                }
                break;
            case 'view':
                const interpreterPath = vscode.workspace.getConfiguration().get('sagemathEnhanced.interpreterPath');
                const fullCommand = currentArgs ? `${interpreterPath} ${currentArgs}` : interpreterPath;
                vscode.window.showInformationMessage(`Current command: ${fullCommand}`);
                break;
        }
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(troubleshootDisposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map