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
exports.SageMathNotebookController = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
class SageMathNotebookController {
    controller;
    tempDir;
    constructor() {
        this.controller = vscode.notebooks.createNotebookController('sagemath-kernel', 'jupyter-notebook', 'SageMath');
        this.controller.label = 'SageMath';
        this.controller.description = 'SageMath kernel for executing SageMath code in notebooks';
        this.controller.supportedLanguages = ['sage', 'python'];
        this.controller.supportsExecutionOrder = true;
        this.controller.executeHandler = this.executeCell.bind(this);
        // Set execution order starting point
        this.controller.executionOrder = 0;
        // Create temporary directory for notebook cell files
        this.tempDir = path.join(os.tmpdir(), 'sagemath-vscode-notebook');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        // Check if notebook kernel is enabled
        const isEnabled = vscode.workspace.getConfiguration().get('sagemathEnhanced.notebookKernelEnabled', true);
        if (!isEnabled) {
            vscode.window.showInformationMessage('SageMath notebook kernel is disabled. Enable it in settings to use SageMath in notebooks.');
        }
    }
    async executeCell(cells, notebook, controller) {
        for (const cell of cells) {
            await this.executeSingleCell(cell);
        }
    }
    async executeSingleCell(cell) {
        const execution = this.controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this.controller.executionOrder;
        execution.start(Date.now());
        try {
            const code = cell.document.getText();
            if (!code.trim()) {
                execution.end(true, Date.now());
                return;
            }
            // Check if notebook kernel is enabled
            const isEnabled = vscode.workspace.getConfiguration().get('sagemathEnhanced.notebookKernelEnabled', true);
            if (!isEnabled) {
                const errorOutput = new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.text('SageMath notebook kernel is disabled. Enable it in extension settings.', 'text/plain')
                ]);
                execution.replaceOutput([errorOutput]);
                execution.end(false, Date.now());
                return;
            }
            // Create a temporary .sage file for the cell content
            const cellId = `cell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const sageFilePath = path.join(this.tempDir, `${cellId}.sage`);
            // Write cell content to temporary file
            fs.writeFileSync(sageFilePath, code);
            // Get SageMath interpreter path from configuration
            const sagePath = vscode.workspace.getConfiguration().get('sagemathEnhanced.interpreterPath', 'sage');
            const useWSL = vscode.workspace.getConfiguration().get('sagemathEnhanced.useWSL', false);
            // Execute the SageMath code
            const result = await this.executeSageMathCode(sageFilePath, sagePath, useWSL);
            // Clean up temporary file
            try {
                fs.unlinkSync(sageFilePath);
                // Also clean up the generated .py file if it exists
                const pyFilePath = sageFilePath + '.py';
                if (fs.existsSync(pyFilePath)) {
                    fs.unlinkSync(pyFilePath);
                }
            }
            catch (cleanupError) {
                console.warn('Failed to clean up temporary files:', cleanupError);
            }
            // Create output for the cell
            if (result.output) {
                const output = new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.text(result.output, 'text/plain')
                ]);
                execution.replaceOutput([output]);
            }
            if (result.error) {
                const errorOutput = new vscode.NotebookCellOutput([
                    vscode.NotebookCellOutputItem.error(new Error(result.error))
                ]);
                execution.replaceOutput([errorOutput]);
                execution.end(false, Date.now());
            }
            else {
                execution.end(true, Date.now());
            }
        }
        catch (error) {
            const errorOutput = new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.error(error)
            ]);
            execution.replaceOutput([errorOutput]);
            execution.end(false, Date.now());
        }
    }
    async executeSageMathCode(filePath, sagePath, useWSL) {
        return new Promise((resolve) => {
            const { exec } = require('child_process');
            const fileName = path.basename(filePath);
            const fileDir = path.dirname(filePath);
            let command;
            if (process.platform === 'win32' && useWSL) {
                command = `wsl cd "${fileDir}" && ${sagePath} "${fileName}"`;
            }
            else if (process.platform === 'win32') {
                command = `cd "${fileDir.replace(/\//g, '\\')}" && ${sagePath} "${fileName}"`;
            }
            else {
                command = `cd "${fileDir}" && ${sagePath} "${fileName}"`;
            }
            // For win32, wrap with cmd /c
            if (process.platform === 'win32' && !useWSL) {
                command = `cmd /c "${command.replace(/"/g, '""')}"`;
            }
            exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
                if (error) {
                    resolve({ error: `Execution error: ${error.message}\n${stderr}` });
                }
                else {
                    resolve({ output: stdout || (stderr ? `Warning: ${stderr}` : 'Code executed successfully') });
                }
            });
        });
    }
    dispose() {
        this.controller.dispose();
        // Clean up temporary directory
        try {
            if (fs.existsSync(this.tempDir)) {
                fs.rmSync(this.tempDir, { recursive: true, force: true });
            }
        }
        catch (error) {
            console.warn('Failed to clean up temporary directory:', error);
        }
    }
}
exports.SageMathNotebookController = SageMathNotebookController;
//# sourceMappingURL=notebookController.js.map