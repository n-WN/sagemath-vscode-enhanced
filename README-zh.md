# SageMath Enhanced for VS Code

使用SageMath Enhanced扩展增强您在Visual Studio Code中的SageMath编程体验。此扩展提供高级功能和集成，使在VS Code中使用SageMath变得更加简单高效。

## 特性 

- **运行SageMath代码**：只需简单点击即可直接从编辑器执行`.sage`文件。
- **语法高亮**：享受为SageMath特定操作和函数量身定做的增强语法高亮。
- **集成终端**：直接在VS Code的集成终端中与SageMath交互。
- **自动`.sage.py`文件清理**：运行SageMath脚本后自动删除临时生成的`.sage.py`文件，保持您的工作空间整洁。
- **WSL支持**：对于Windows用户，可在Windows子系统Linux（WSL）内运行SageMath脚本，以提高兼容性和性能。

![运行SageMath文件按钮](images/start.png) *👆🏻 运行 SageMath 文件按钮的屏幕截图，👇🏻 演示视频（下载或打开 Github 仓库在线观看）*

https://github.com/n-WN/sagemath-vscode-enhanced/assets/30841158/2a8d5cea-8c21-4886-8e18-b48893691fe4

## 快速开始

1. **安装**：从VS Code Marketplace安装SageMath Enhanced扩展。
2. **打开Sage文件**：在VS Code中打开任何`.sage`文件或创建一个新文件。
3. **运行代码**：使用命令面板（`Ctrl+Shift+P` / `Cmd+Shift+P`），键入`Run SageMath File`来执行您的脚本。
4. **查看输出**：检查集成终端中的脚本输出和任何错误消息。

## 安装

按照以下步骤安装SageMath Enhanced扩展：

1. 启动VS Code。
2. 按`Ctrl+P`（在macOS上为`Cmd+P`）打开快速打开对话框。
3. 键入`ext install sagemath-enhanced`并按Enter键。
4. 在搜索结果中找到SageMath Enhanced扩展并点击`Install`按钮。

## 使用

使用SageMath Enhanced扩展简单直观，为SageMath编码提供无缝体验。

### 打开和运行SageMath文件

1. **打开Sage文件**：在VS Code中打开您的`.sage`文件，或通过选择`File > New File`并以`.sage`扩展名保存来创建一个新文件。
2. **运行代码**：一旦`.sage`文件在编辑器中打开，您会在编辑器标题栏中注意到一个**Run SageMath File**按钮（▶️图标）。点击此按钮将执行当前活动的`.sage`文件中的SageMath代码。
3. **自动清理**：如果在扩展设置中启用，执行期间生成的临时`.sage.py`文件将在脚本运行结束后自动删除。
4. **WSL支持**：如果您使用的是Windows并安装了WSL，该扩展可以在WSL中运行SageMath脚本以增强兼容性。

### 查看输出

- **集成终端**：您的SageMath脚本输出以及任何错误或警告将显示在VS Code的集成终端中。这允许轻松调试和与您的代码交互。

## 要求

- [Visual Studio Code](https://code.visualstudio.com/) 版本 1.76.0 或更高。
- [SageMath](http://www.sagemath.org/) 安装并可以从命令行访问。

## 贡献

我们欢迎对SageMath Enhanced扩展的贡献。以下是您可以贡献的方式：

1. 在GitHub上分叉仓库。您可以在[sagemath-vscode-enhanced](https://github.com/n-WN/sagemath-vscode-enhanced)找到该仓库。
2. 为

您的功能创建一个新分支（`git checkout -b feature/YourFeature`）。
3. 提交您的更改（`git commit -am 'Add some YourFeature'`）。
4. 推送到分支（`git push origin feature/YourFeature`）。
5. 在GitHub上针对`sagemath-vscode-enhanced`仓库创建一个新的Pull Request。

## 支持和反馈

如果您遇到任何问题或有改进建议，请在[GitHub仓库](https://github.com/n-WN/sagemath-vscode-enhanced/issues)上提交问题。

## 许可证

该项目在AGPL-3.0许可下获得授权 - 详情见[LICENSE](LICENSE)文件。

## 待办事项（又名"需要帮助"）

- [ ] **代码补全**：增强SageMath特定语法的代码补全功能。
- [ ] **交互式绘图**：在VS Code内启用交互式SageMath绘图的渲染。
- [ ] **文档集成**：通过悬停提示直接提供对SageMath文档的访问。
- [ ] **性能优化**：改善扩展的启动时间和响应速度。
- [ ] **自定义设置**：引入设置以根据用户偏好自定义扩展的行为。
- [ ] **错误高亮**：为语法错误和计算异常提供即时反馈，以简化编码过程。
- [ ] **缩进和自动补全**：当前，可能存在缩进快捷键问题，以及无法自动补全括号和引号。这些高级编辑功能可能需要实现或集成语言服务器支持。

## 致谢

- 特别感谢[SageMath](http://www.sagemath.org/)社区提供的宝贵资源和支持。