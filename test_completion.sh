#!/bin/bash

# SageMath Enhanced LSP Server Test Script
# This script helps test the completion functionality

echo "🧪 SageMath Enhanced - Completion Test Script"
echo "=============================================="

# Check if VS Code is available
if command -v code &> /dev/null; then
    echo "✅ VS Code found"
    
    # Check if the extension files are present
    if [ -f "package.json" ] && [ -f "server/src/server.ts" ]; then
        echo "✅ Extension files found"
        
        # Build the extension
        echo "🔨 Building extension..."
        npm run compile
        
        if [ $? -eq 0 ]; then
            echo "✅ Build successful"
            
            # Open test file
            echo "📂 Opening test file in VS Code..."
            code test_poly_completion.sage
            
            echo ""
            echo "🎯 Manual Test Instructions:"
            echo "1. In VS Code, place cursor after 'Poly' on line 6"
            echo "2. Press Ctrl+Space (or Cmd+Space on macOS) to trigger completion"
            echo "3. Look for 'PolynomialRing' in the completion list"
            echo "4. It should appear near the top with high priority"
            echo ""
            echo "✅ If PolynomialRing appears in the top 3 suggestions, the fix works!"
            echo "❌ If PolynomialRing doesn't appear or is buried deep, there may be an issue"
            
        else
            echo "❌ Build failed"
            exit 1
        fi
    else
        echo "❌ Extension files not found. Run this script from the extension root directory."
        exit 1
    fi
else
    echo "❌ VS Code not found. Please install VS Code to test the extension."
    echo "   Alternative: Use any LSP-compatible editor to test completion."
    exit 1
fi

echo ""
echo "📚 Additional Test Cases:"
echo "Try typing these partial inputs and check for PolynomialRing completion:"
echo "- 'P' → should show PolynomialRing in results"
echo "- 'Po' → should show PolynomialRing in results" 
echo "- 'Pol' → should show PolynomialRing in results"
echo "- 'Poly' → should show PolynomialRing with high priority"
echo "- 'Polyno' → should show PolynomialRing with highest priority"