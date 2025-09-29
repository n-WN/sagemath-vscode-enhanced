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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs")); // 引入文件系统模块
class SageDocumentSymbolProvider {
    provideDocumentSymbols(document) {
        const rootSymbols = [];
        const stack = [];
        for (let line = 0; line < document.lineCount; line++) {
            const lineText = document.lineAt(line);
            const trimmed = lineText.text.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            const match = this.matchSymbol(trimmed);
            if (!match) {
                continue;
            }
            const indent = lineText.firstNonWhitespaceCharacterIndex;
            const { name, detail, kind } = match;
            const range = new vscode.Range(line, indent, line, lineText.range.end.character);
            const symbol = new vscode.DocumentSymbol(name, detail, kind, range, range);
            while (stack.length && indent <= stack[stack.length - 1].indent) {
                stack.pop();
            }
            if (stack.length) {
                stack[stack.length - 1].symbol.children.push(symbol);
            }
            else {
                rootSymbols.push(symbol);
            }
            stack.push({ indent, symbol });
        }
        return rootSymbols;
    }
    matchSymbol(line) {
        const defMatch = line.match(/^def\s+([\w\.]+)\s*\(([^)]*)\)\s*:?/);
        if (defMatch) {
            const [, name, params] = defMatch;
            return {
                name,
                detail: `(${params.trim()})`,
                kind: vscode.SymbolKind.Function,
            };
        }
        const classMatch = line.match(/^class\s+([\w\.]+)\s*(\([^)]*\))?\s*:?/);
        if (classMatch) {
            const [, name, bases = ''] = classMatch;
            return {
                name,
                detail: bases.trim(),
                kind: vscode.SymbolKind.Class,
            };
        }
        const assignmentMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*.+/);
        if (assignmentMatch) {
            const [, name] = assignmentMatch;
            return {
                name,
                detail: 'assignment',
                kind: vscode.SymbolKind.Variable,
            };
        }
        return undefined;
    }
}
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
        if (process.platform === 'win32' && vscode.workspace.getConfiguration().get('sagemathEnhanced.useWSL')) {
            command = `cd "${fileDir}" && wsl ${sagePath} "${fileName}"`; // 临时方案, 似乎并不能唤起远程, 仅在vscode ssh到wsl时可用
        }
        else if (process.platform === 'win32') {
            command = `cd "${fileDir.replace(/\//g, '\\')}" && ${sagePath} "${fileName}"`;
        }
        else {
            command = `cd "${fileDir}" && ${sagePath} "${fileName}"`;
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
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider({ language: 'sage' }, new SageDocumentSymbolProvider());
    context.subscriptions.push(disposable);
    context.subscriptions.push(symbolProvider);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map