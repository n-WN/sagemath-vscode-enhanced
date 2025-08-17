#!/usr/bin/env node

const { LSPClient } = require('./test_lsp_completion.js');

/**
 * Test completion for newly added functions
 */
async function testNewFunctions() {
    const client = new LSPClient();
    
    try {
        // Start server and initialize
        await client.startServer();
        await client.initialize();

        // Test document content with new function completion scenarios
        const testContent = `# Test new functions
BKZ
legendre_symbol
FiniteField
QuaternionAlgebra
fourier_transform
hermite_form
`;

        const testUri = 'file:///tests/test_new_functions.sage';
        await client.openDocument(testUri, testContent);
        
        // Wait a bit for document processing
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('\n🧪 Testing new function completions...\n');

        // Test cases for new functions
        const testFunctions = [
            'BKZ', 'legendre_symbol', 'FiniteField', 'QuaternionAlgebra', 
            'fourier_transform', 'hermite_form'
        ];

        let allTestsPassed = true;

        for (const funcName of testFunctions) {
            console.log(`📝 Testing "${funcName}" completion...`);
            
            try {
                // Test completion by typing the first few characters at proper line positions
                const testInput = funcName.substring(0, Math.min(4, funcName.length));
                // Create proper test document with function on separate lines
                const lineIndex = testFunctions.indexOf(funcName) + 1;
                const completions = await client.getCompletion(testUri, lineIndex, testInput.length);
                
                console.log(`   Found ${completions.length} completion items for "${testInput}"`);
                
                // Check if the function is in the results
                const foundItem = completions.find(item => 
                    item.label === funcName || 
                    item.insertText === funcName
                );
                
                if (foundItem) {
                    console.log(`   ✅ ${funcName} found`);
                    console.log(`      Sort text: "${foundItem.sortText}"`);
                    console.log(`      Detail: "${foundItem.detail}"`);
                } else {
                    console.log(`   ❌ ${funcName} not found in completion results`);
                    allTestsPassed = false;
                }
                
            } catch (error) {
                console.error(`   💥 Error testing "${funcName}":`, error.message);
                allTestsPassed = false;
            }
            
            console.log('');
        }

        console.log('📊 Test Summary:');
        if (allTestsPassed) {
            console.log('🎉 All new function tests passed!');
        } else {
            console.log('❌ Some new function tests failed.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    } finally {
        await client.shutdown();
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🧪 SageMath Enhanced - New Functions Completion Test');
    console.log('===================================================\n');
    
    console.log('This script tests completion for newly added SageMath functions.\n');
    
    try {
        await testNewFunctions();
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    main();
}