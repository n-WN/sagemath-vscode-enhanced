import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	Hover,
	MarkupKind,
	DocumentSymbol,
	SymbolKind,
	Range
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// Create a connection for the server using Node's IPC as a transport.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// SageMath built-in functions and classes
const SAGEMATH_BUILTINS = [
	// Rings and Fields
	'ZZ', 'QQ', 'RR', 'CC', 'GF', 'Zmod', 'PolynomialRing', 'NumberField',
	'LaurentPolynomialRing', 'PowerSeriesRing', 'FractionField', 'QuotientRing',
	'FiniteField', 'CyclotomicField', 'QuaternionAlgebra', 'MatrixAlgebra',
	// Basic functions
	'var', 'vars', 'SR', 'solve', 'factor', 'expand', 'simplify', 'diff', 'integrate',
	// Polynomial operations
	'Polynomial', 'poly', 'polynomial', 'polygen', 'PolynomialQuotientRing',
	// Linear algebra
	'matrix', 'vector', 'identity_matrix', 'zero_matrix', 'ones_matrix',
	'random_matrix', 'diagonal_matrix', 'block_matrix',
	// Plotting
	'plot', 'plot3d', 'parametric_plot', 'parametric_plot3d', 'implicit_plot',
	'list_plot', 'scatter_plot', 'contour_plot',
	// Number theory
	'gcd', 'lcm', 'is_prime', 'next_prime', 'prime_range', 'factorial',
	'euler_phi', 'divisors', 'prime_divisors', 'factor_trial_division',
	'legendre_symbol', 'jacobi_symbol', 'kronecker_symbol', 'quadratic_residues',
	'continued_fraction', 'convergents', 'nth_prime', 'prime_pi', 'discrete_log',
	// Lattice algorithms
	'LLL', 'BKZ', 'hermite_form', 'smith_form',
	// Combinatorics
	'Permutations', 'Combinations', 'Partitions', 'binomial',
	'catalan_number', 'fibonacci', 'lucas_number', 'stirling_number1', 'stirling_number2',
	// Graph theory
	'Graph', 'DiGraph', 'graphs',
	// Geometry
	'Point', 'Line', 'Circle', 'Polygon', 'Polyhedron',
	// Calculus
	'limit', 'taylor', 'series', 'laplace', 'inverse_laplace',
	'derivative', 'integral', 'sum', 'product', 'fourier_transform',
	'laplace_transform', 'symbolic_sum', 'symbolic_product',
	// Cryptography
	'RSA', 'ElGamal', 'DiffieHellman', 'AES', 'DES',
	// Elliptic curves
	'EllipticCurve', 'EllipticCurve_from_j',
	// Probability
	'random', 'randint', 'choice', 'shuffle',
	// Special functions
	'sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs', 'floor', 'ceil',
	'gamma', 'beta', 'zeta', 'bessel_J', 'bessel_Y',
	// Constants
	'pi', 'e', 'I', 'infinity', 'oo', 'NaN', 'golden_ratio'
];

// SageMath methods that are commonly used
const SAGEMATH_METHODS = [
	'parent', 'base_ring', 'characteristic', 'degree', 'gen', 'gens',
	'nrows', 'ncols', 'rank', 'det', 'trace', 'transpose', 'inverse',
	'eigenvalues', 'eigenvectors', 'charpoly', 'minimal_polynomial',
	'norm', 'conjugate', 'real_part', 'imag_part', 'numerator', 'denominator',
	'collect', 'coefficient', 'substitute', 'subs', 'variables',
	'is_zero', 'is_one', 'is_unit', 'is_nilpotent', 'is_invertible',
	'save', 'load', 'show', 'latex', 'pretty_print'
];

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ['.', '(', '[', ' ']
			},
			// Tell the client that this server supports hover information.
			hoverProvider: true,
			// Tell the client that this server supports definition lookup.
			definitionProvider: true,
			// Tell the client that this server supports find references.
			referencesProvider: true,
			// Tell the client that this server supports document symbols.
			documentSymbolProvider: true
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onDocumentSymbol(params => {
	const document = documents.get(params.textDocument.uri);
	if (!document) {
		return [];
	}

	return parseDocumentSymbols(document);
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The global settings, used when the `workspace/configuration` request is not supported by the client.
interface SageMathSettings {
	maxNumberOfProblems: number;
	enableDiagnostics: boolean;
	enableCompletion: boolean;
	sagePath: string;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
const defaultSettings: SageMathSettings = { 
	maxNumberOfProblems: 1000, 
	enableDiagnostics: true,
	enableCompletion: true,
	sagePath: 'sage'
};
let globalSettings: SageMathSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<SageMathSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <SageMathSettings>(
			(change.settings.sagemathEnhanced || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<SageMathSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'sagemathEnhanced'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	const settings = await getDocumentSettings(textDocument.uri);
	
	if (!settings.enableDiagnostics) {
		return;
	}

	const text = textDocument.getText();
	const problems = 0;
	const diagnostics: Diagnostic[] = [];

	// Basic syntax checking for SageMath
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		
		// Check for common SageMath syntax issues
		// Check for unmatched parentheses, brackets, braces
		const openParens = (line.match(/\(/g) || []).length;
		const closeParens = (line.match(/\)/g) || []).length;
		if (openParens !== closeParens) {
			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Warning,
				range: {
					start: { line: i, character: 0 },
					end: { line: i, character: line.length }
				},
				message: `Unmatched parentheses on line ${i + 1}`,
				source: 'sagemath-enhanced'
			};
			diagnostics.push(diagnostic);
		}

		// Check for undefined variables that might be typos
		const varPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?!=)/g;
		let match;
		while ((match = varPattern.exec(line)) !== null) {
			const varName = match[1];
			// Skip if it's a known SageMath builtin
			if (!SAGEMATH_BUILTINS.includes(varName) && 
				!['var', 'x', 'y', 'z', 't', 'n', 'i', 'j', 'k'].includes(varName)) {
				// This could be enhanced with proper scope analysis
			}
		}
	}

	// Send the computed diagnostics to VS Code.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VS Code
	connection.console.log('We received a file change event');
});

// Helper function to get the word being typed at the cursor position
function getWordAtPosition(document: TextDocument, position: { line: number; character: number }): string {
	const line = document.getText({
		start: { line: position.line, character: 0 },
		end: { line: position.line, character: position.character }
	});
	
	// Match word characters at the end of the line up to cursor position
	const match = line.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
	return match ? match[0] : '';
}

// Helper function to check if a string matches a partial input (fuzzy matching)
function isPartialMatch(input: string, target: string): boolean {
	if (!input) {
		return true; // Empty input matches everything
	}
	
	const inputLower = input.toLowerCase();
	const targetLower = target.toLowerCase();
	
	// Direct substring match (highest priority)
	if (targetLower.includes(inputLower)) {
		return true;
	}
	
	// Prefix match (very high priority) 
	if (targetLower.startsWith(inputLower)) {
		return true;
	}
	
	// Fuzzy match - check if all characters in input appear in order in target
	// But only if the input is reasonably short to avoid too many false positives
	// Allow fuzzy matching only if input length is at most 60% of target length, minimum 3
	const maxFuzzyLength = Math.max(3, Math.floor(targetLower.length * 0.6));
	if (inputLower.length <= maxFuzzyLength && inputLower.length >= 2) {
		let targetIndex = 0;
		for (let i = 0; i < inputLower.length; i++) {
			const char = inputLower[i];
			const foundIndex = targetLower.indexOf(char, targetIndex);
			if (foundIndex === -1) {
				return false;
			}
			targetIndex = foundIndex + 1;
		}
		return true;
	}
	
	return false;
}

// This handler provides the initial list of the completion items.
connection.onCompletion(
	async (textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
		const document = documents.get(textDocumentPosition.textDocument.uri);
		if (!document) {
			return [];
		}

		// Check if completion is enabled for this document
		const settings = await getDocumentSettings(textDocumentPosition.textDocument.uri);
		if (!settings.enableCompletion) {
			return [];
		}

		// Get the current word being typed
		const currentWord = getWordAtPosition(document, textDocumentPosition.position);
		const items: CompletionItem[] = [];

		// Add filtered SageMath built-ins
		SAGEMATH_BUILTINS.forEach((builtin, index) => {
			if (isPartialMatch(currentWord, builtin)) {
				// Enhanced sorting: prioritize important functions and exact prefix matches
				let sortPriority = '1'; // Default priority
				
				if (currentWord && builtin.toLowerCase().startsWith(currentWord.toLowerCase())) {
					// Exact prefix match gets highest priority
					sortPriority = '0';
				} else if (currentWord && builtin.toLowerCase().includes(currentWord.toLowerCase())) {
					// Substring match gets medium priority
					sortPriority = '0.5';
				}
				
				// Special handling for very important functions
				const importantFunctions = ['PolynomialRing', 'matrix', 'plot', 'EllipticCurve', 'Graph'];
				if (importantFunctions.includes(builtin) && isPartialMatch(currentWord, builtin)) {
					// Boost priority for important functions
					sortPriority = '0' + sortPriority;
				}
				
				items.push({
					label: builtin,
					kind: CompletionItemKind.Function,
					data: index + 1,
					detail: 'SageMath built-in',
					documentation: `SageMath built-in function or class: ${builtin}`,
					insertText: builtin,
					filterText: builtin,
					sortText: sortPriority + builtin.toLowerCase()
				});
			}
		});

		// Add filtered common methods
		SAGEMATH_METHODS.forEach((method, index) => {
			if (isPartialMatch(currentWord, method)) {
				// Consistent sorting for methods
				let sortPriority = '2'; // Lower priority than built-ins
				
				if (currentWord && method.toLowerCase().startsWith(currentWord.toLowerCase())) {
					sortPriority = '1.5'; // Better than default methods but after built-ins
				}
				
				items.push({
					label: method,
					kind: CompletionItemKind.Method,
					data: SAGEMATH_BUILTINS.length + index + 1,
					detail: 'SageMath method',
					documentation: `Common SageMath method: ${method}`,
					insertText: method,
					filterText: method,
					sortText: sortPriority + method.toLowerCase()
				});
			}
		});

		return items;
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		// Provide more detailed documentation for specific items
		const detailedDocs: { [key: string]: string } = {
			'ZZ': 'The ring of integers. Example: ZZ(5) creates the integer 5 in the integer ring.',
			'QQ': 'The field of rational numbers. Example: QQ(1/2) creates the rational number 1/2.',
			'RR': 'The field of real numbers with arbitrary precision. Example: RR(pi)',
			'CC': 'The field of complex numbers. Example: CC(1, 2) creates 1 + 2*I',
			'PolynomialRing': 'Creates a polynomial ring. Example: R = PolynomialRing(QQ, "x"); x = R.gen()',
			'LaurentPolynomialRing': 'Creates a Laurent polynomial ring. Example: R = LaurentPolynomialRing(QQ, "x")',
			'PowerSeriesRing': 'Creates a power series ring. Example: R = PowerSeriesRing(QQ, "x")',
			'NumberField': 'Creates a number field. Example: K = NumberField(x^2 - 2, "a")',
			'GF': 'Creates a finite field (Galois field). Example: F = GF(7) or F = GF(2^8)',
			'EllipticCurve': 'Creates an elliptic curve. Example: E = EllipticCurve([0, 0, 0, -1, 0])',
			'var': 'Creates symbolic variables. Example: var("x y z") creates symbolic variables x, y, z',
			'matrix': 'Creates a matrix. Example: matrix([[1,2],[3,4]]) creates a 2x2 matrix',
			'plot': 'Plots functions. Example: plot(sin(x), (x, 0, 2*pi))',
			'solve': 'Solves equations. Example: solve(x^2 - 4 == 0, x)',
			'factor': 'Factors polynomials or integers. Example: factor(x^2 - 4)',
			'integrate': 'Computes integrals. Example: integrate(sin(x), x)',
			'diff': 'Computes derivatives. Example: diff(sin(x), x)',
			'expand': 'Expands expressions. Example: expand((x+1)^3)',
			'simplify': 'Simplifies expressions. Example: simplify(sin(x)^2 + cos(x)^2)',
			'Graph': 'Creates a graph. Example: G = Graph(); G.add_edges([(1,2), (2,3)])',
			'gcd': 'Greatest common divisor. Example: gcd(12, 18)',
			'is_prime': 'Tests primality. Example: is_prime(17)',
			'factorial': 'Computes factorial. Example: factorial(5)'
		};

		if (detailedDocs[item.label]) {
			item.documentation = {
				kind: MarkupKind.Markdown,
				value: detailedDocs[item.label]
			};
		}

		return item;
	}
);

// Provide hover information
connection.onHover(
	(_textDocumentPosition: TextDocumentPositionParams): Hover | undefined => {
		// This is a simplified hover provider
		// In a real implementation, you'd parse the document to find what's under the cursor
		return {
			contents: {
				kind: MarkupKind.Markdown,
				value: [
					'**SageMath Enhanced**',
					'',
					'Hover over SageMath symbols to get documentation.',
					'',
					'Use Ctrl+Space for code completion.'
				].join('\n')
			}
		};
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

interface SymbolMatch {
	name: string;
	detail: string;
	kind: SymbolKind;
}

function matchSymbol(line: string): SymbolMatch | undefined {
	const defMatch = line.match(/^def\s+([\w\.]+)\s*\(([^)]*)\)\s*:?/);
	if (defMatch) {
		const [, name, params] = defMatch;
		return {
			name,
			detail: `(${params.trim()})`,
			kind: SymbolKind.Function
		};
	}

	const classMatch = line.match(/^class\s+([\w\.]+)\s*(\([^)]*\))?\s*:?/);
	if (classMatch) {
		const [, name, bases = ''] = classMatch;
		return {
			name,
			detail: bases.trim(),
			kind: SymbolKind.Class
		};
	}

	const assignmentMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*.+/);
	if (assignmentMatch) {
		const [, name] = assignmentMatch;
		return {
			name,
			detail: 'assignment',
			kind: SymbolKind.Variable
		};
	}

	return undefined;
}

function buildRange(line: number, indent: number, length: number): Range {
	return {
		start: { line, character: indent },
		end: { line, character: length }
	};
}

function parseDocumentSymbols(textDocument: TextDocument): DocumentSymbol[] {
	const rootSymbols: DocumentSymbol[] = [];
	const stack: Array<{ indent: number; symbol: DocumentSymbol }> = [];

	for (let line = 0; line < textDocument.lineCount; line++) {
		const lineText = textDocument.getText({
			start: { line, character: 0 },
			end: { line: line + 1, character: 0 }
		});
		const content = lineText.replace(/\n$/, '');
		const trimmed = content.trim();

		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		const symbolMatch = matchSymbol(trimmed);
		if (!symbolMatch) {
			continue;
		}

		const indent = content.length - content.trimStart().length;
		const range = buildRange(line, indent, content.length);
		const symbol: DocumentSymbol = {
			name: symbolMatch.name,
			detail: symbolMatch.detail,
			kind: symbolMatch.kind,
			range,
			selectionRange: range,
			children: []
		};

		while (stack.length && indent <= stack[stack.length - 1].indent) {
			stack.pop();
		}

		if (stack.length) {
			stack[stack.length - 1].symbol.children?.push(symbol);
		} else {
			rootSymbols.push(symbol);
		}

		stack.push({ indent, symbol });
	}

	return rootSymbols;
}
