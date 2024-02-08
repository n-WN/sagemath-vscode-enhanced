import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('runsagemathfile.run', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No editor is active');
            return;
        }

        const document = editor.document;
        // console.log(document.fileName.endsWith('.sage'))
        // if (!document.fileName.endsWith('.sage')) {
        // 检测文件类型是否为SageMath文件
        console.log(document.languageId)
        if (document.languageId !== 'sage') {
            vscode.window.showInformationMessage('The active file is not a SageMath file');
            return;
        }

        const filePath = document.fileName;
        // 创建或获取一个名为'SageMath'的终端
        let terminal = vscode.window.terminals.find(t => t.name === 'SageMath');
        if (!terminal) {
            terminal = vscode.window.createTerminal('SageMath');
        }
        terminal.show();
        terminal.sendText(`sage "${filePath}"`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
