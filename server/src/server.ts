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
	MarkupKind
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
	// Combinatorics
	'Permutations', 'Combinations', 'Partitions', 'binomial',
	'catalan_number', 'fibonacci', 'lucas_number', 'stirling_number1', 'stirling_number2',
	// Graph theory
	'Graph', 'DiGraph', 'graphs',
	// Geometry
	'Point', 'Line', 'Circle', 'Polygon', 'Polyhedron',
	// Calculus
	'limit', 'taylor', 'series', 'laplace', 'inverse_laplace',
	'derivative', 'integral', 'sum', 'product',
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
	if (!input) return true; // Empty input matches everything
	
	const inputLower = input.toLowerCase();
	const targetLower = target.toLowerCase();
	
	// Direct substring match (highest priority)
	if (targetLower.includes(inputLower)) {
		return true;
	}
	
	// Fuzzy match - check if all characters in input appear in order in target
	// But only if the input is reasonably short to avoid too many false positives
	// Allow fuzzy matching only if input length is at most 60% of target length, minimum 3
	const maxFuzzyLength = Math.max(3, Math.floor(targetLower.length * 0.6));
	if (inputLower.length <= maxFuzzyLength) {
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
	(textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		const document = documents.get(textDocumentPosition.textDocument.uri);
		if (!document) {
			return [];
		}

		// Get the current word being typed
		const currentWord = getWordAtPosition(document, textDocumentPosition.position);
		const items: CompletionItem[] = [];

		// Add filtered SageMath built-ins
		SAGEMATH_BUILTINS.forEach((builtin, index) => {
			if (isPartialMatch(currentWord, builtin)) {
				items.push({
					label: builtin,
					kind: CompletionItemKind.Function,
					data: index + 1,
					detail: 'SageMath built-in',
					documentation: `SageMath built-in function or class: ${builtin}`,
					insertText: builtin,
					filterText: builtin,
					// Add sort text to prioritize exact matches
					sortText: currentWord && builtin.toLowerCase().startsWith(currentWord.toLowerCase()) 
						? '0' + builtin 
						: '1' + builtin
				});
			}
		});

		// Add filtered common methods
		SAGEMATH_METHODS.forEach((method, index) => {
			if (isPartialMatch(currentWord, method)) {
				items.push({
					label: method,
					kind: CompletionItemKind.Method,
					data: SAGEMATH_BUILTINS.length + index + 1,
					detail: 'SageMath method',
					documentation: `Common SageMath method: ${method}`,
					insertText: method,
					filterText: method,
					// Add sort text to prioritize exact matches
					sortText: currentWord && method.toLowerCase().startsWith(currentWord.toLowerCase()) 
						? '0' + method 
						: '1' + method
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