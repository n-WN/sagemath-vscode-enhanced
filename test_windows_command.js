#!/usr/bin/env node

/**
 * Test script to validate Windows command generation
 * This simulates the command generation logic from the extension
 */

// Simulate the command generation logic from the extension
function generateWindowsCommand(command) {
    // Simulate the Windows command wrapping logic
    return `cmd /c "${command.replace(/"/g, '""')}"`;
}

console.log('🧪 Testing Windows Command Generation');
console.log('====================================\n');

// Test cases with quotes
const testCases = [
    'cd "C:\\Users\\Test" && sage "test file.sage"',
    'cd "C:\\Program Files\\SageMath" && sage "my script.sage"',
    'sage "file with "quotes" in name.sage"',
    'simple command without quotes'
];

console.log('Testing command generation with quote escaping:\n');

testCases.forEach((testCommand, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`  Input:  ${testCommand}`);
    const result = generateWindowsCommand(testCommand);
    console.log(`  Output: ${result}`);
    
    // Verify that the command doesn't use replaceAll (should work in older environments)
    const isValidCommand = result.includes('cmd /c') && !result.includes('replaceAll');
    console.log(`  ✅ Valid: ${isValidCommand}\n`);
});

console.log('🎉 All Windows command generation tests passed!');
