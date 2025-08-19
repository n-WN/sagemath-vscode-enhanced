import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

const execAsync = promisify(exec);

let client: LanguageClient;

/**
 * Check if SageMath is available on the system
 * @param sagePath Path to the SageMath interpreter
 * @returns Promise<boolean> indicating if SageMath is available
 */
async function checkSageMathAvailability(sagePath: string): Promise<boolean> {
    try {
        // Try to run sage --version to check if it's available
        const command = process.platform === 'win32' ? `where ${sagePath}` : `which ${sagePath}`;
        await execAsync(command);
        return true;
    } catch (error) {
        try {
            // Fallback: try to run sage directly with --version
            await execAsync(`${sagePath} --version`);
            return true;
        } catch (secondError) {
            return false;
        }
    }
}

/**
 * Show SageMath installation guidance to the user
 */
function showSageMathInstallationGuidance(): void {
    const installMessage = 'SageMath is not installed or not found in PATH. Please install SageMath to run .sage files.';
    const installButton = 'Installation Guide';
    const configButton = 'Configure Path';
    
    vscode.window.showErrorMessage(installMessage, installButton, configButton).then(selection => {
        if (selection === installButton) {
            vscode.env.openExternal(vscode.Uri.parse('https://doc.sagemath.org/html/en/installation/'));
        } else if (selection === configButton) {
            vscode.commands.executeCommand('workbench.action.openSettings', 'sagemathEnhanced.interpreterPath');
        }
    });
}

export function activate(context: vscode.ExtensionContext) {
    // Register the run command first to ensure it's available even if language server fails
    let runDisposable = vscode.commands.registerCommand('runsagemathfile.run', async () => {
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

        // Check if SageMath is available before trying to run
        const isSageAvailable = await checkSageMathAvailability(sagePath);
        if (!isSageAvailable) {
            showSageMathInstallationGuidance();
            return;
        }

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
    let restartDisposable = vscode.commands.registerCommand('sagemathEnhanced.restartServer', async () => {
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

    context.subscriptions.push(runDisposable, restartDisposable);

    // Check SageMath availability on activation and show guidance if needed
    checkSageMathAvailabilityOnActivation();

    // Start the Language Server asynchronously to avoid blocking command registration
    startLanguageServer(context).catch(error => {
        console.error('Failed to start SageMath Language Server:', error);
        vscode.window.showWarningMessage('SageMath Language Server failed to start. Some features may not be available.');
    });
}

/**
 * Check SageMath availability when the extension activates
 * Show a one-time informational message if SageMath is not available
 */
async function checkSageMathAvailabilityOnActivation(): Promise<void> {
    try {
        const sagePath = vscode.workspace.getConfiguration().get('sagemathEnhanced.interpreterPath') as string;
        const isSageAvailable = await checkSageMathAvailability(sagePath);
        
        if (!isSageAvailable) {
            // Only show this message if the user hasn't seen it before
            const dontShowAgainKey = 'sagemathEnhanced.dontShowSageWarning';
            const dontShowAgain = vscode.workspace.getConfiguration().get(dontShowAgainKey) as boolean;
            
            if (!dontShowAgain) {
                const message = 'SageMath is not detected on your system. You can still use language features, but running .sage files requires SageMath installation.';
                const installButton = 'Install SageMath';
                const configButton = 'Configure Path';
                const dontShowButton = "Don't Show Again";
                
                vscode.window.showInformationMessage(message, installButton, configButton, dontShowButton).then(selection => {
                    if (selection === installButton) {
                        vscode.env.openExternal(vscode.Uri.parse('https://doc.sagemath.org/html/en/installation/'));
                    } else if (selection === configButton) {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'sagemathEnhanced.interpreterPath');
                    } else if (selection === dontShowButton) {
                        vscode.workspace.getConfiguration().update(dontShowAgainKey, true, vscode.ConfigurationTarget.Global);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error checking SageMath availability on activation:', error);
    }
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
