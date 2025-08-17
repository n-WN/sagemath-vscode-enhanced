#!/usr/bin/env node

/**
 * LSP Client Test Script for SageMath Enhanced
 * 
 * This script simulates a VS Code client to test the language server's completion functionality.
 * It specifically tests that inputs like "Poly", "PolRin", "polR" return "PolynomialRing" in the results.
 * 
 * The script:
 * 1. Starts the language server as a child process
 * 2. Establishes LSP communication via stdio
 * 3. Sends initialization requests
 * 4. Tests various completion scenarios
 * 5. Verifies that PolynomialRing appears in the results
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class LSPClient {
    constructor() {
        this.server = null;
        this.messageId = 1;
        this.pendingRequests = new Map();
        this.buffer = '';
        this.isInitialized = false;
    }

    /**
     * Start the language server process
     */
    async startServer() {
        const serverPath = path.join(__dirname, 'out', 'server', 'src', 'server.js');
        
        if (!fs.existsSync(serverPath)) {
            throw new Error(`Server not found at ${serverPath}. Run 'npm run compile' first.`);
        }

        console.log('🚀 Starting language server...');
        this.server = spawn('node', [serverPath, '--stdio'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.server.stdout.on('data', (data) => {
            this.handleServerMessage(data);
        });

        this.server.stderr.on('data', (data) => {
            console.error('Server stderr:', data.toString());
        });

        this.server.on('close', (code) => {
            console.log(`Server process exited with code ${code}`);
        });

        this.server.on('error', (error) => {
            console.error('Server error:', error);
        });

        // Wait a bit for server to start
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Handle incoming messages from the language server
     */
    handleServerMessage(data) {
        this.buffer += data.toString();
        
        // Process complete messages
        while (true) {
            const match = this.buffer.match(/^Content-Length: (\d+)\r?\n\r?\n/);
            if (!match) break;
            
            const contentLength = parseInt(match[1]);
            const headerLength = match[0].length;
            
            if (this.buffer.length < headerLength + contentLength) {
                break; // Incomplete message
            }
            
            const messageContent = this.buffer.substring(headerLength, headerLength + contentLength);
            this.buffer = this.buffer.substring(headerLength + contentLength);
            
            try {
                const message = JSON.parse(messageContent);
                this.handleMessage(message);
            } catch (error) {
                console.error('Failed to parse message:', error);
                console.error('Message content:', messageContent);
            }
        }
    }

    /**
     * Handle parsed LSP message
     */
    handleMessage(message) {
        if (message.id && this.pendingRequests.has(message.id)) {
            const resolve = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            resolve(message);
        } else if (message.method) {
            // Handle notifications/requests from server
            if (message.method === 'workspace/configuration') {
                // Respond with default configuration
                this.sendMessage({
                    jsonrpc: '2.0',
                    id: message.id,
                    result: [{
                        maxNumberOfProblems: 100,
                        enableDiagnostics: true,
                        enableCompletion: true,
                        sagePath: 'sage'
                    }]
                });
            } else if (message.method === 'client/registerCapability') {
                // Acknowledge capability registration
                this.sendMessage({
                    jsonrpc: '2.0',
                    id: message.id,
                    result: null
                });
            } else {
                console.log('Server notification/request:', message.method);
            }
        }
    }

    /**
     * Send an LSP message to the server
     */
    sendMessage(message) {
        const content = JSON.stringify(message);
        const header = `Content-Length: ${Buffer.byteLength(content, 'utf8')}\r\n\r\n`;
        this.server.stdin.write(header + content);
    }

    /**
     * Send a request and wait for response
     */
    async sendRequest(method, params) {
        const id = this.messageId++;
        const message = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, resolve);
            this.sendMessage(message);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error(`Request ${method} timed out`));
                }
            }, 10000);
        });
    }

    /**
     * Initialize the LSP connection
     */
    async initialize() {
        console.log('🔗 Initializing LSP connection...');
        
        const response = await this.sendRequest('initialize', {
            processId: process.pid,
            clientInfo: {
                name: 'LSP Test Client',
                version: '1.0.0'
            },
            rootUri: `file://${__dirname}`,
            capabilities: {
                textDocument: {
                    completion: {
                        dynamicRegistration: false,
                        completionItem: {
                            snippetSupport: false
                        }
                    }
                },
                workspace: {
                    configuration: true
                }
            }
        });

        if (response.error) {
            throw new Error(`Initialization failed: ${response.error.message}`);
        }

        // Send initialized notification
        this.sendMessage({
            jsonrpc: '2.0',
            method: 'initialized',
            params: {}
        });

        this.isInitialized = true;
        console.log('✅ LSP connection initialized');
        return response.result;
    }

    /**
     * Open a text document
     */
    async openDocument(uri, content) {
        this.sendMessage({
            jsonrpc: '2.0',
            method: 'textDocument/didOpen',
            params: {
                textDocument: {
                    uri,
                    languageId: 'sage',
                    version: 1,
                    text: content
                }
            }
        });
    }

    /**
     * Request completion at a specific position
     */
    async getCompletion(uri, line, character) {
        if (!this.isInitialized) {
            throw new Error('LSP client not initialized');
        }

        const response = await this.sendRequest('textDocument/completion', {
            textDocument: { uri },
            position: { line, character }
        });

        return response.result || [];
    }

    /**
     * Shutdown the server
     */
    async shutdown() {
        if (this.server) {
            try {
                await this.sendRequest('shutdown', {});
                this.sendMessage({
                    jsonrpc: '2.0',
                    method: 'exit',
                    params: {}
                });
            } catch (error) {
                console.error('Error during shutdown:', error);
            }
            
            // Force kill if still running after 2 seconds
            setTimeout(() => {
                if (this.server && !this.server.killed) {
                    this.server.kill('SIGKILL');
                }
            }, 2000);
        }
    }
}

/**
 * Test completion functionality
 */
async function testCompletion() {
    const client = new LSPClient();
    
    try {
        // Start server and initialize
        await client.startServer();
        await client.initialize();

        // Test document content with various completion scenarios
        const testContent = `# SageMath completion test
# Test case 1: Simple completion
Poly
# Test case 2: Assignment
ring = PolRin
# Test case 3: Lowercase partial
polR
# Test case 4: In function call
my_function(Polyno
# Test case 5: Just 'P'
P
`;

        const testUri = 'file:///test_completion.sage';
        await client.openDocument(testUri, testContent);
        
        // Wait a bit for document processing
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('\n🧪 Testing completion scenarios...\n');

        // Test cases with expected positions
        const testCases = [
            { name: 'Poly', line: 2, character: 4, input: 'Poly' },
            { name: 'PolRin', line: 4, character: 10, input: 'PolRin' },
            { name: 'polR', line: 6, character: 4, input: 'polR' },
            { name: 'Polyno', line: 8, character: 18, input: 'Polyno' },
            { name: 'P', line: 10, character: 1, input: 'P' }
        ];

        let allTestsPassed = true;

        for (const testCase of testCases) {
            console.log(`📝 Testing "${testCase.input}" completion...`);
            
            try {
                const completions = await client.getCompletion(testUri, testCase.line, testCase.character);
                
                console.log(`   Found ${completions.length} completion items`);
                
                // Check if PolynomialRing is in the results
                const polynomialRingItem = completions.find(item => 
                    item.label === 'PolynomialRing' || 
                    item.insertText === 'PolynomialRing'
                );
                
                if (polynomialRingItem) {
                    console.log(`   ✅ PolynomialRing found at position ${completions.indexOf(polynomialRingItem) + 1}`);
                    console.log(`      Sort text: "${polynomialRingItem.sortText}"`);
                    console.log(`      Detail: "${polynomialRingItem.detail}"`);
                    
                    // Check if it's in top 5 (indicating good prioritization)
                    const position = completions.indexOf(polynomialRingItem) + 1;
                    if (position <= 5) {
                        console.log(`   🌟 Excellent! PolynomialRing is in top 5 (position ${position})`);
                    } else {
                        console.log(`   ⚠️  PolynomialRing found but not in top 5 (position ${position})`);
                    }
                } else {
                    console.log(`   ❌ PolynomialRing NOT found in completion results`);
                    allTestsPassed = false;
                }
                
                // Show top 5 results for debugging
                console.log('   Top 5 completions:');
                completions.slice(0, 5).forEach((item, index) => {
                    console.log(`      ${index + 1}. ${item.label} (${item.sortText})`);
                });
                
            } catch (error) {
                console.error(`   ❌ Error testing "${testCase.input}":`, error.message);
                allTestsPassed = false;
            }
            
            console.log('');
        }

        // Summary
        console.log('📊 Test Summary:');
        if (allTestsPassed) {
            console.log('🎉 All tests passed! PolynomialRing completion is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Check the completion logic.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        await client.shutdown();
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🧪 SageMath Enhanced - LSP Completion Test');
    console.log('==========================================\n');
    
    console.log('This script tests the Language Server Protocol completion functionality.');
    console.log('It verifies that typing "Poly", "PolRin", "polR", etc. returns "PolynomialRing" in completion results.\n');
    
    try {
        await testCompletion();
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Test interrupted by user');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    process.exit(1);
});

// Run the test
if (require.main === module) {
    main();
}

module.exports = { LSPClient, testCompletion };