# Change Log

All notable changes to the "SageMath Enhanced" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [2.0.0] - 2024-01-XX

### Added - Major Rewrite with LSP Implementation

- **🚀 Language Server Protocol (LSP) Support**: Complete rewrite with full LSP implementation
- **💡 Intelligent Code Completion**: Context-aware autocompletion for SageMath functions, classes, and methods
- **📖 Hover Documentation**: Instant documentation and type information on hover
- **🔍 Enhanced Syntax Highlighting**: Comprehensive syntax highlighting for SageMath-specific constructs:
  - Ring and field declarations (ZZ, QQ, RR, CC, GF, etc.)
  - Polynomial rings and generators
  - Mathematical functions and operators
  - Linear algebra operations
  - Plotting and visualization functions
  - Number theory and combinatorics functions
  - Cryptographic functions
  - Graph theory constructs
- **⚡ Code Snippets**: 30+ pre-built code snippets for common SageMath patterns
- **🔧 Enhanced Language Configuration**: Improved indentation, bracket matching, and auto-closing pairs
- **📊 Real-time Diagnostics**: Syntax validation and error detection
- **🔄 Server Management**: Restart language server command for troubleshooting
- **⚙️ Extended Configuration**: New settings for controlling LSP features

### Changed

- Completely rewritten extension architecture with proper LSP client-server design
- Enhanced TextMate grammar with comprehensive SageMath pattern recognition
- Improved language configuration with better editor experience
- Updated package.json with new commands and configuration options

### Technical Improvements

- Migrated from simple command-based extension to full LSP implementation
- Added TypeScript language server with SageMath-specific capabilities
- Implemented proper client-server communication via JSON-RPC
- Enhanced build system to support both client and server compilation
- Added comprehensive code snippets for better developer experience

## [1.3.3] - Previous Version

- Basic script execution functionality
- Simple TextMate grammar inheriting from Python
- Windows WSL support (partial)
- Automatic .sage.py file cleanup

## [1.0.0] - Initial Release

- Basic SageMath file execution
- Simple syntax highlighting