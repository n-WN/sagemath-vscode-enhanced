#!/bin/bash

# SageMath Enhanced LSP Server Test Script
# This script provides both automated and manual testing for the completion functionality

echo "🧪 SageMath Enhanced - Completion Test Script"
echo "=============================================="

# Function to run automated LSP test
run_automated_test() {
    echo "🤖 Running automated LSP completion test..."
    echo ""
    
    if [ -f "test_lsp_completion.js" ]; then
        node test_lsp_completion.js
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            echo ""
            echo "✅ Automated test completed successfully!"
            return 0
        else
            echo ""
            echo "❌ Automated test failed!"
            return 1
        fi
    else
        echo "❌ Automated test script not found (test_lsp_completion.js)"
        return 1
    fi
}

# Function to run manual test
run_manual_test() {
    echo "👤 Setting up manual test in VS Code..."
    echo ""
    
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
                echo "4. It should appear at position 1 with highest priority"
                echo ""
                echo "✅ If PolynomialRing appears in the top 3 suggestions, the fix works!"
                echo "❌ If PolynomialRing doesn't appear or is buried deep, there may be an issue"
                
            else
                echo "❌ Build failed"
                return 1
            fi
        else
            echo "❌ Extension files not found. Run this script from the extension root directory."
            return 1
        fi
    else
        echo "❌ VS Code not found. Please install VS Code to test the extension."
        echo "   Alternative: Use any LSP-compatible editor to test completion."
        return 1
    fi
}

# Main script logic
echo "Choose test mode:"
echo "1. Automated LSP test (recommended)"
echo "2. Manual VS Code test"
echo "3. Both tests"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        run_automated_test
        ;;
    2)
        run_manual_test
        ;;
    3)
        echo "Running both automated and manual tests..."
        echo ""
        run_automated_test
        if [ $? -eq 0 ]; then
            echo ""
            echo "==========================================="
            echo ""
            run_manual_test
        fi
        ;;
    *)
        echo "Invalid choice. Running automated test by default..."
        run_automated_test
        ;;
esac

echo ""
echo "📚 Additional Test Cases:"
echo "The automated test covers these scenarios:"
echo "- 'P' → PolynomialRing should be #1"
echo "- 'Poly' → PolynomialRing should be #1" 
echo "- 'PolRin' → PolynomialRing should be #1"
echo "- 'polR' → PolynomialRing should be #1"
echo "- 'Polyno' → PolynomialRing should be #1"
echo ""
echo "All tests verify that PolynomialRing appears in the completion results"
echo "and is properly prioritized based on the enhanced sorting algorithm."