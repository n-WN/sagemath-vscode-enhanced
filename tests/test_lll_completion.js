#!/usr/bin/env node

const { LSPClient } = require('./test_lsp_completion.js');

/**
 * Test LLL completion functionality
 */
async function testLLLCompletion() {
    const client = new LSPClient();
    
    try {
        // Start server and initialize
        await client.startServer();
        await client.initialize();

        // Test document content with LLL completion scenarios
        const testContent = `# SageMath LLL completion test
# Test case 1: Simple completion
LLL
# Test case 2: Assignment
alg = LLL
# Test case 3: Lowercase partial
lll
# Test case 4: In function call
my_function(LLL
# Test case 5: Just 'L'
L
`;

        const testUri = 'file:///tests/test_lll_completion.sage';
        await client.openDocument(testUri, testContent);
        
        // Wait a bit for document processing
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('\n🧪 Testing LLL completion scenarios...\n');

        // Test cases with expected positions
        const testCases = [
            { name: 'LLL', line: 2, character: 3, input: 'LLL' },
            { name: 'LLL', line: 4, character: 9, input: 'LLL' },
            { name: 'lll', line: 6, character: 3, input: 'lll' },
            { name: 'LLL', line: 8, character: 16, input: 'LLL' },
            { name: 'L', line: 10, character: 1, input: 'L' }
        ];

        let allTestsPassed = true;

        for (const testCase of testCases) {
            console.log(`📝 Testing "${testCase.input}" completion...`);
            
            try {
                const completions = await client.getCompletion(testUri, testCase.line, testCase.character);
                
                console.log(`   Found ${completions.length} completion items`);
                
                // Check if LLL is in the results
                const lllItem = completions.find(item => 
                    item.label === 'LLL' || 
                    item.insertText === 'LLL'
                );
                
                if (lllItem) {
                    console.log(`   ✅ LLL found at position ${completions.indexOf(lllItem) + 1}`);
                    console.log(`      Sort text: "${lllItem.sortText}"`);
                    console.log(`      Detail: "${lllItem.detail}"`);
                    
                    // Check if it's in top 10 (indicating good prioritization)
                    const position = completions.indexOf(lllItem) + 1;
                    if (position <= 10) {
                        console.log(`   🌟 Great! LLL is in top 10 (position ${position})`);
                    } else {
                        console.log(`   ⚠️  LLL found but not in top 10 (position ${position})`);
                    }
                } else {
                    console.log(`   ❌ LLL not found in completion results`);
                    allTestsPassed = false;
                }
                
                // Show top 5 for debugging
                console.log(`   Top 5 completions:`);
                completions.slice(0, 5).forEach((item, index) => {
                    console.log(`      ${index + 1}. ${item.label} (${item.sortText})`);
                });
                
            } catch (error) {
                console.error(`   💥 Error testing "${testCase.input}":`, error.message);
                allTestsPassed = false;
            }
            
            console.log('');
        }

        console.log('📊 Test Summary:');
        if (allTestsPassed) {
            console.log('🎉 All tests passed! LLL completion is working correctly.');
        } else {
            console.log('❌ Some tests failed! LLL completion needs to be fixed.');
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
    console.log('🧪 SageMath Enhanced - LLL Completion Test');
    console.log('==========================================\n');
    
    console.log('This script tests the Language Server Protocol completion functionality for LLL.');
    console.log('It verifies that typing "LLL", "lll", "L", etc. returns "LLL" in completion results.\n');
    
    try {
        await testLLLCompletion();
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    main();
}

module.exports = { testLLLCompletion };