#!/usr/bin/env node

const { LSPClient } = require('./test_lsp_completion.js');

/**
 * Simple demonstration that LLL completion works
 */
async function demonstrateLLLFix() {
    const client = new LSPClient();
    
    try {
        console.log('🧪 Demonstrating LLL Completion Fix');
        console.log('==================================\n');
        
        // Start server and initialize
        console.log('🚀 Starting language server...');
        await client.startServer();
        await client.initialize();
        console.log('✅ LSP connection initialized\n');

        // Test document with LLL
        const testContent = `# Test LLL completion
LLL
`;

        const testUri = 'file:///demo.sage';
        await client.openDocument(testUri, testContent);
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('📝 Testing "LLL" completion...');
        
        const completions = await client.getCompletion(testUri, 1, 3);
        
        const lllItem = completions.find(item => item.label === 'LLL');
        
        if (lllItem) {
            console.log('✅ SUCCESS: LLL function found in completion results!');
            console.log(`   Label: ${lllItem.label}`);
            console.log(`   Detail: ${lllItem.detail}`);
            console.log(`   Sort text: ${lllItem.sortText}`);
            console.log('\n🎉 The LLL completion issue has been fixed!');
        } else {
            console.log('❌ FAILED: LLL function not found in completion results');
            console.log('Available completions:');
            completions.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.label}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await client.shutdown();
    }
}

// Run the demonstration
if (require.main === module) {
    demonstrateLLLFix();
}