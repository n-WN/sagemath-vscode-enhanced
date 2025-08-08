<p align="center">
  <img src="images/gptGenIcon.png" width="25%" />
</p>

<h1 align="center">SageMath Enhanced for VS Code</h1>

<p align="center">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-blue" alt="License">
  <a href="https://github.com/n-WN/sagemath-vscode-enhanced/issues">
    <img src="https://img.shields.io/github/issues/n-WN/sagemath-vscode-enhanced" alt="GitHub issues">
  </a>
  <img src="https://img.shields.io/github/languages/count/n-WN/sagemath-vscode-enhanced"  alt="GitHub languages">
  <img src="https://img.shields.io/github/last-commit/n-WN/sagemath-vscode-enhanced" alt="last commit">
  <img src="https://img.shields.io/visual-studio-marketplace/last-updated/Lov3.sagemath-enhanced" alt="visual-studio-marketplace-last-updated">
  <a href="https://github.com/n-WN/sagemath-vscode-enhanced/network">
    <img src="https://img.shields.io/github/forks/n-WN/sagemath-vscode-enhanced" alt="GitHub forks">
  </a>
  <a href="https://github.com/n-WN/sagemath-vscode-enhanced/stargazers">
    <img src="https://img.shields.io/github/stars/n-WN/sagemath-vscode-enhanced" alt="GitHub stars">
  </a>
  <img src="https://img.shields.io/github/languages/top/n-WN/sagemath-vscode-enhanced?style=social" alt="languages-top">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a>
</p>

Enhance your SageMath coding experience in Visual Studio Code with the SageMath Enhanced extension. This extension provides advanced features and integrations, making it easier and more efficient to work with SageMath in VS Code.

## Features

- **Run SageMath Code**: Directly execute `.sage` files from the editor with a simple click.
- **Syntax Highlighting**: Enjoy enhanced syntax highlighting tailored for SageMath-specific operations and functions.
- **Integrated Terminal**: Interact with SageMath directly within VS Code's integrated terminal.
- **Automatic `.sage.py` File Cleanup**: Automatically deletes the temporary `.sage.py` file generated after running a SageMath script, keeping your workspace clean.
- **Custom Command Arguments**: Configure additional command arguments for the SageMath interpreter (e.g., `-python` flag for pwntools compatibility).
- **Interactive Troubleshooting**: Built-in troubleshooting command to help resolve common execution issues.
- **WSL Support(Fixing)**: For Windows users, run SageMath scripts inside the Windows Subsystem for Linux (WSL) for improved compatibility and performance.

![Run SageMath File Button](images/start.png) *👆🏻 the Run SageMath File button, 👇🏻 Demo video*

https://github.com/n-WN/sagemath-vscode-enhanced/assets/30841158/2a8d5cea-8c21-4886-8e18-b48893691fe4

## Quick Start

1. **Installation**: Install the SageMath Enhanced extension from the VS Code Marketplace.
2. **Opening Sage Files**: Open any `.sage` file or create a new one in VS Code.
3. **Running Code**: Use the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type `Run SageMath File` to execute your script.
4. **Viewing Output**: Check the integrated terminal for your script's output and any error messages.

## Installation

Follow these steps to install the SageMath Enhanced extension:

1. Launch VS Code.
2. Press `Ctrl+P` (`Cmd+P` on macOS) to open the Quick Open dialog.
3. Type `ext install sagemath-enhanced` and press Enter.
4. Find the SageMath Enhanced extension in the search results and click the `Install` button.

## Usage

Using the SageMath Enhanced extension is simple and intuitive, providing a seamless experience for SageMath coding within VS Code.

### Opening and Running SageMath Files

1. **Opening a Sage File**: Open your `.sage` file in VS Code, or create a new one by selecting `File > New File` and saving it with the `.sage` extension.
2. **Running the Code**: Once a `.sage` file is open in the editor, you'll notice a **Run SageMath File** button (▶️ icon) in the editor's title bar. Clicking this button will execute the SageMath code in the currently active `.sage` file.
3. **Automatic Cleanup**: If enabled in the extension settings, the temporary `.sage.py` file generated during execution will be automatically deleted after the script finishes running.
4. **WSL Support**: If you're on Windows and have WSL installed, the extension can run SageMath scripts inside WSL for enhanced compatibility.

### Viewing Output

- **Integrated Terminal**: The output from your SageMath script, along with any errors or warnings, will be displayed in VS Code's integrated terminal. This allows for easy debugging and interaction with your code.

### Troubleshooting Execution Issues

If you encounter issues when running SageMath scripts (such as pwntools compatibility problems), use the built-in troubleshooting feature:

1. **Access Troubleshooting**: 
   - Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type "SageMath: Troubleshoot Execution Issues"
   - Or right-click in a `.sage` file and select "SageMath: Troubleshoot Execution Issues"

2. **Available Options**:
   - **Fix pwntools/curses compatibility issues**: Automatically adds the `-python` flag to bypass SageMath environment initialization
   - **Custom command arguments**: Manually specify any command arguments (e.g., `--verbose`, `--debug`)
   - **View current configuration**: See the current command structure being used

3. **Common Issues**:
   - **pwntools compatibility**: If you see `_curses.error: setupterm: could not find terminfo database`, use the pwntools fix option
   - **Custom requirements**: Use the custom arguments option to add any specific flags your use case requires

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/) version 1.76.0 or higher.
- [SageMath](http://www.sagemath.org/) installed and accessible from the command line.

## Contributing

We welcome contributions to the SageMath Enhanced extension. Here's how you can contribute:

1. Fork the repository on GitHub. You can find the repository at [sagemath-vscode-enhanced](https://github.com/n-WN/sagemath-vscode-enhanced).
2. Create a new branch for your feature (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add some YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request on GitHub against the `sagemath-vscode-enhanced` repository.

## Support and Feedback

If you encounter any issues or have suggestions for improvements, please file an issue on the [GitHub repository](https://github.com/n-WN/sagemath-vscode-enhanced/issues).

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## TODO (Also Known As "Need Help")

- [ ] **Code Completion**: Enhance code completion for SageMath-specific syntax.
- [ ] **Interactive Plots**: Enable rendering of interactive SageMath plots within VS Code.
- [ ] **Documentation Integration**: Provide direct access to SageMath documentation via hover tooltips.
- [ ] **Performance Optimization**: Improve startup time and responsiveness of the extension.
- [ ] **Customizable Settings**: Introduce settings to customize the extension's behavior according to user preferences.
- [ ] **Error Highlighting**: Provide immediate feedback on syntax errors and computational exceptions to streamline the coding process.
- [ ] **Indentation and Autocomplete**: Currently, there might be issues with indentation shortcuts and the inability to autocomplete brackets and quotes. These advanced editing features might require the implementation or integration of a language server.

<!-- For the issues with indentation and autocomplete, if they cannot be resolved through simple configuration changes, it might indeed necessitate the assistance of a more sophisticated language server (such as implementing a Language Server Protocol server specifically for SageMath) to provide advanced support similar to what Pylance does for Python. This could involve a significant development effort, including a deep understanding of SageMath syntax and features, as well as integration with VS Code's language server APIs. -->

## Acknowledgements

- Special thanks to the [SageMath](http://www.sagemath.org/) community for their invaluable resources and support.
