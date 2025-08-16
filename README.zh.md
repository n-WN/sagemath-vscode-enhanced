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

使用SageMath Enhanced扩展增强您在Visual Studio Code中的SageMath编程体验。此扩展提供高级功能和集成，使在VS Code中使用SageMath变得更加简单高效。

## 特性 

- **🚀 语言服务器协议 (LSP) 支持**: 完整的LSP实现，提供高级语言功能
- **💡 智能代码补全**: 针对SageMath函数、类和方法的上下文感知自动补全
- **📖 悬停文档**: 悬停时即时显示文档和类型信息
- **🔍 语法高亮**: 全面的SageMath特定构造语法高亮，包括：
  - 环和域声明 (ZZ, QQ, RR, CC, GF等)
  - 多项式环和生成元
  - 数学函数和运算符
  - 线性代数运算
  - 绘图和可视化函数
  - 数论和组合数学函数
  - 密码学函数
  - 图论构造
- **⚡ 代码片段**: 常见SageMath模式的预制代码片段
- **🔧 增强的语言配置**: 改进的缩进、括号匹配和自动闭合配对
- **▶️ 脚本执行**: 直接从编辑器运行SageMath文件
- **🧹 自动清理**: 可选择移除生成的`.sage.py`文件
- **🐧 WSL支持**: 增强的Windows子系统Linux兼容性
- **📊 诊断**: 实时错误检测和语法验证
- **🔄 服务器管理**: 重启语言服务器命令用于故障排除

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

- [x] **代码补全**：✅ 通过LSP实现了SageMath特定语法的增强代码补全功能。
- [x] **语法高亮**：✅ 全面的SageMath操作和函数语法高亮。
- [x] **错误高亮**：✅ 实时诊断反馈，提供语法错误和计算异常的即时反馈。
- [x] **语言服务器协议**：✅ 完整的LSP实现，包含悬停、补全和诊断功能。
- [x] **代码片段**：✅ 常见SageMath模式的预制片段。
- [ ] **交互式绘图**：在VS Code内启用交互式SageMath绘图的渲染。
- [ ] **文档集成**：通过增强的悬停提示提供全面的SageMath文档访问。
- [ ] **性能优化**：进一步改善扩展的启动时间和响应速度。
- [ ] **高级诊断**：与SageMath深度集成进行语义错误检查。
- [ ] **重构支持**：SageMath符号的代码重构功能。
- [ ] **调试支持**：SageMath脚本的逐步调试。
- [ ] **笔记本集成**：支持SageMath笔记本(.ipynb with SageMath kernel)。

扩展现在提供了具有适当LSP架构的坚实基础。未来的增强将专注于更深入的SageMath集成和高级IDE功能。
- [ ] **缩进和自动补全**：当前，可能存在缩进快捷键问题，以及无法自动补全括号和引号。这些高级编辑功能可能需要实现或集成语言服务器支持。

## 致谢

- 特别感谢[SageMath](http://www.sagemath.org/)社区提供的宝贵资源和支持。