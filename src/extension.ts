import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs'; // 引入文件系统模块

export function activate(context: vscode.ExtensionContext) {
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
        } else if (process.platform === 'win32') {
            command = `cd "${fileDir.replace(/\//g, '\\')}" && ${baseCommand} "${fileName}"`;
        } else {
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

    context.subscriptions.push(disposable);
}

export function deactivate() { }
