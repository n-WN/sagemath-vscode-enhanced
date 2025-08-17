# LSP Completion Testing Documentation

## Overview

This document describes the comprehensive testing framework for the SageMath Enhanced LSP completion functionality. The testing verifies that inputs like "Poly", "PolRin", "polR" return "PolynomialRing" with high priority in the completion results.

## Testing Approach

### 1. Automated LSP Client Testing (`test_lsp_completion.js`)

This is the primary testing method that simulates a VS Code client interacting with the language server programmatically.

#### How it Works

1. **Server Process Management**: Spawns the compiled language server (`out/server/src/server.js`) with `--stdio` flag
2. **LSP Protocol Implementation**: Implements a minimal LSP client that can:
   - Send and receive LSP messages via stdio
   - Handle JSON-RPC 2.0 protocol
   - Parse Content-Length headers
   - Manage request/response correlation
3. **Configuration Handling**: Responds to server configuration requests with appropriate settings
4. **Completion Testing**: Sends `textDocument/completion` requests for various test scenarios

#### Test Scenarios

| Input | Position | Expected Result |
|-------|----------|----------------|
| "Poly" | After "Poly" | PolynomialRing at position 1 |
| "PolRin" | After "PolRin" | PolynomialRing at position 1 |
| "polR" | After "polR" | PolynomialRing at position 1 |
| "Polyno" | After "Polyno" | PolynomialRing at position 1 |
| "P" | After "P" | PolynomialRing at position 1 |

#### Verification Criteria

- ✅ PolynomialRing must appear in completion results
- ✅ PolynomialRing must be in top 5 results (preferably position 1)
- ✅ Sort text should indicate proper prioritization (starts with "00" for highest priority)

### 2. Manual Testing (`test_completion.sh` + `test_poly_completion.sage`)

#### Interactive Shell Script
- Provides options for automated, manual, or both test modes
- Handles project compilation and VS Code setup
- Offers user-friendly interface for test selection

#### Manual Test File
`test_poly_completion.sage` contains various completion scenarios:
```sage
# Test case 1: Simple completion
Poly

# Test case 2: Assignment context
ring = PolRin

# Test case 3: Lowercase partial
polR

# Test case 4: Function call context
my_function(Polyno

# Test case 5: Just 'P'
P
```

## LSP Communication Protocol

### Message Flow

1. **Initialization**:
   ```
   Client → Server: initialize request
   Server → Client: initialize response
   Client → Server: initialized notification
   ```

2. **Configuration**:
   ```
   Server → Client: workspace/configuration request
   Client → Server: configuration response with settings
   ```

3. **Document Operations**:
   ```
   Client → Server: textDocument/didOpen notification
   Server → Client: textDocument/publishDiagnostics notification
   ```

4. **Completion Requests**:
   ```
   Client → Server: textDocument/completion request
   Server → Client: completion response with items
   ```

### Configuration Settings

The test client provides these settings to the server:
```json
{
  "maxNumberOfProblems": 100,
  "enableDiagnostics": true,
  "enableCompletion": true,
  "sagePath": "sage"
}
```

## Expected Completion Behavior

### Sorting Algorithm

The enhanced sorting algorithm uses priority prefixes:

- `00` - Highest priority for important functions with exact/partial matches
- `0` - Exact prefix matches  
- `0.5` - Substring matches
- `1` - Default priority
- `1.5` - Methods with prefix match
- `2` - Default method priority

### PolynomialRing Priority Boost

For inputs containing "Poly" or similar patterns, PolynomialRing receives special handling:
- Gets `00` priority prefix (highest)
- Appears at position 1 in results
- Has enhanced fuzzy matching

### Sample Results

For input "Poly":
```
1. PolynomialRing (00polynomialring)          ← Priority boost
2. LaurentPolynomialRing (0.5laurentpolynomialring)
3. Polynomial (0polynomial)
4. poly (0poly)
5. polynomial (0polynomial)
```

## Running the Tests

### Automated Test Only
```bash
node test_lsp_completion.js
```

### Interactive Test Menu
```bash
./test_completion.sh
```
Choose option 1 for automated, 2 for manual, or 3 for both.

### Prerequisites
- Node.js installed
- Project compiled (`npm run compile`)
- All dependencies installed (`npm install`)

## Troubleshooting

### Common Issues

1. **Server fails to start**: 
   - Ensure project is compiled: `npm run compile`
   - Check server path exists: `out/server/src/server.js`

2. **Completion timeout**:
   - Verify configuration handling in client
   - Check server stdout/stderr for errors

3. **Incorrect results**:
   - Review sorting algorithm in `server/src/server.ts`
   - Verify priority boost logic for PolynomialRing

### Debug Output

The automated test provides detailed output:
- Number of completion items found
- Position of PolynomialRing in results
- Sort text for verification
- Top 5 completions for analysis

## Integration with CI/CD

The automated test can be integrated into continuous integration:
```bash
# In CI pipeline
npm run compile
node test_lsp_completion.js
```

Exit codes:
- `0` - All tests passed
- `1` - One or more tests failed

## Future Enhancements

1. **Additional Test Cases**: More complex scenarios (nested completions, imports, etc.)
2. **Performance Testing**: Measure completion response times
3. **Fuzzy Matching Tests**: Verify edge cases in fuzzy matching algorithm
4. **Configuration Variations**: Test with different settings combinations