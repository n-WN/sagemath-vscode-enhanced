# SageMath Notebook Support

This extension now provides enhanced notebook support for SageMath code in Jupyter notebooks within VS Code.

## Features

### Notebook Kernel
- **SageMath Kernel**: A dedicated notebook kernel for running SageMath code in Jupyter notebook cells
- **Cell Execution**: Execute SageMath code directly in notebook cells with proper output handling
- **Error Handling**: Display execution errors and warnings in notebook cell outputs
- **Syntax Highlighting**: SageMath syntax highlighting works automatically in notebook cells

### Configuration
- **Enable/Disable Kernel**: Control notebook kernel availability via settings
- **Interpreter Path**: Use the same SageMath interpreter path setting for both files and notebooks
- **WSL Support**: Notebook execution respects WSL settings for Windows users

## Usage

1. **Open a Jupyter Notebook** (`.ipynb` file) in VS Code
2. **Select SageMath Kernel**: Choose "SageMath" from the kernel picker in the notebook interface
3. **Write SageMath Code**: Write SageMath code in notebook cells (language should be set to "sage" or "python")
4. **Execute Cells**: Run cells to execute SageMath code and see the output

## Settings

The following settings control notebook behavior:

- `sagemathEnhanced.notebookKernelEnabled`: Enable/disable the SageMath notebook kernel (default: true)
- `sagemathEnhanced.interpreterPath`: Path to SageMath interpreter (default: "sage")
- `sagemathEnhanced.useWSL`: Use WSL for SageMath execution on Windows (default: false)

## Example Notebook

The extension includes a sample notebook (`test-notebook.ipynb`) demonstrating SageMath functionality in notebooks.

## Requirements

- Visual Studio Code with Jupyter extension
- SageMath installed and accessible from command line
- Proper configuration of `sagemathEnhanced.interpreterPath` setting if SageMath is not in PATH