# SageMath Enhanced for VS Code

Enhance your SageMath coding experience in Visual Studio Code with the SageMath Enhanced extension. This extension provides advanced features and integrations, making it easier and more efficient to work with SageMath in VS Code.

## Features

- **Run SageMath Code**: Directly execute `.sage` files from the editor with a simple click.
- **Syntax Highlighting**: Enjoy enhanced syntax highlighting tailored for SageMath-specific operations and functions.
- **Integrated Terminal**: Interact with SageMath directly within VS Code's integrated terminal.

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

    ![Run SageMath File Button](path/to/your/screenshot.png) *(Consider adding a screenshot showing the button)*

    Alternatively, you can also run your SageMath script by opening the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`), typing `Run SageMath File`, and pressing `Enter`. This will execute the code in the integrated terminal, where you can view the results and any error messages.

### Viewing Output

- **Integrated Terminal**: The output from your SageMath script, along with any errors or warnings, will be displayed in VS Code's integrated terminal. This allows for easy debugging and interaction with your code.

<!-- ### Additional Features

- **Syntax Highlighting**: Enjoy enhanced syntax highlighting specific to SageMath, making your code easier to read and understand.
- **Error Highlighting**: Get instant feedback on syntax errors and computational exceptions, helping you to quickly identify and resolve issues in your code.

By integrating SageMath directly into your VS Code environment, the SageMath Enhanced extension streamlines your mathematical and computational workflow, making it more efficient and enjoyable. -->

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/) version 1.76.0 or higher.
- [SageMath](http://www.sagemath.org/) installed and accessible from the command line.

## Contributing

We welcome contributions to the SageMath Enhanced extension. Here's how you can contribute:

1. Fork the repository on GitHub. You can find the repository at [sagemath-vscode-enhanced](git@github.com:n-WN/sagemath-vscode-enhanced.git).
2. Create a new branch for your feature (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -am 'Add some YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request on GitHub against the `sagemath-vscode-enhanced` repository.

## Support and Feedback

If you encounter any issues or have suggestions for improvements, please file an issue on the [GitHub repository](https://github.com/n-WN/sagemath-vscode-enhanced/issues).

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## TODO

- [ ] **Code Completion**: Enhance code completion for SageMath-specific syntax.
- [ ] **Interactive Plots**: Enable rendering of interactive SageMath plots within VS Code.
- [ ] **Documentation Integration**: Provide direct access to SageMath documentation via hover tooltips.
- [ ] **Performance Optimization**: Improve startup time and responsiveness of the extension.
- [ ] **Customizable Settings**: Introduce settings to customize the extension's behavior according to user preferences.
- [ ] **Error Highlighting**: Get immediate feedback on syntax errors and computational exceptions to streamline your coding process.

## Acknowledgements

- Special thanks to the [SageMath](http://www.sagemath.org/) community for their invaluable resources and support.
