import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

class SageDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        const rootSymbols: vscode.DocumentSymbol[] = [];
        const stack: Array<{ indent: number; symbol: vscode.DocumentSymbol }> = [];

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
            } else {
                rootSymbols.push(symbol);
            }

            stack.push({ indent, symbol });
        }

        return rootSymbols;
    }

    private matchSymbol(line: string): { name: string; detail: string; kind: vscode.SymbolKind } | undefined {
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

export function activate(context: vscode.ExtensionContext) {
    // Register the run command first to ensure it's available even if language server fails
    const runDisposable = vscode.commands.registerCommand('runsagemathfile.run', () => {
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

        const sagePath = vscode.workspace.getConfiguration().get('sagemathEnhanced.interpreterPath') as string;

        const filePath = document.fileName;
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        const pyFilePath = path.join(fileDir, fileName + '.py');

        const autoDelete = vscode.workspace.getConfiguration().get('sagemathEnhanced.autoDeleteGeneratedFile') as boolean;

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
        } else if (process.platform === 'win32') {
            command = `cd "${fileDir.replace(/\//g, '\\')}" && ${sagePath} "${fileName}"`;
        } else {
            command = `cd "${fileDir}" && ${sagePath} "${fileName}"`;
        }

        // 如果启用了自动删除，并且在执行前文件不存在，则附加删除命令
        if (autoDelete && !fileExistsBeforeRun) {
            const deleteCommand = process.platform === 'win32' ? `del "${pyFilePath}"` : `rm "${pyFilePath}"`;
            command += ` && ${deleteCommand}`;
        }
        // For win32, wrapped by `cmd /c`, because PowerShell 5.1 has no && operator
        if (process.platform === 'win32') {
            command = `cmd /c "${command.replace(/"/g, '""')}"`;
        }

        // 作为单一命令执行
        terminal.sendText(command);
    });

    // Register the restart server command
    const restartDisposable = vscode.commands.registerCommand('sagemathEnhanced.restartServer', async () => {
        try {
            if (client) {
                await client.stop();
            }
            await startLanguageServer(context);
            vscode.window.showInformationMessage('SageMath Language Server restarted');
        } catch (error) {
            console.error('Failed to restart SageMath Language Server:', error);
            vscode.window.showErrorMessage('Failed to restart SageMath Language Server. Check the output console for details.');
        }
    });

    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(
        { language: 'sage' },
        new SageDocumentSymbolProvider()
    );

    context.subscriptions.push(runDisposable, restartDisposable, symbolProvider);

    // Start the Language Server asynchronously to avoid blocking command registration
    startLanguageServer(context).catch(error => {
        console.error('Failed to start SageMath Language Server:', error);
        vscode.window.showWarningMessage('SageMath Language Server failed to start. Some features may not be available.');
    });
}

async function startLanguageServer(context: vscode.ExtensionContext): Promise<void> {
    try {
        // The server is implemented in the server directory
        const serverModule = context.asAbsolutePath(
            path.join('out', 'server', 'src', 'server.js')
        );

        // Check if server module exists
        if (!fs.existsSync(serverModule)) {
            throw new Error(`Language server module not found at: ${serverModule}`);
        }

        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run: { module: serverModule, transport: TransportKind.ipc },
            debug: {
                module: serverModule,
                transport: TransportKind.ipc,
            }
        };

        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            // Register the server for SageMath documents
            documentSelector: [{ scheme: 'file', language: 'sage' }],
            synchronize: {
                // Notify the server about file changes to '.sage' files contained in the workspace
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.sage')
            }
        };

        // Create the language client and start the client.
        client = new LanguageClient(
            'sagemathEnhanced',
            'SageMath Enhanced',
            serverOptions,
            clientOptions
        );

        // Start the client. This will also launch the server
        await client.start();
    } catch (error) {
        console.error('Error in startLanguageServer:', error);
        throw error; // Re-throw to be caught by the calling function
    }
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
