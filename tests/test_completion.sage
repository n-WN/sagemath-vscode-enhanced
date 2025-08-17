# Test file for SageMath completion enhancement
# This file contains examples to test the improved completion functionality

# Test case 1: PolynomialRing completion
# Type "Polyno" and it should suggest "PolynomialRing"
R = PolynomialRing(QQ, 'x')
x = R.gen()

# Test case 2: Other polynomial related functions
# Type "PolyRin" and it should suggest "PolynomialRing"
S = PolynomialRing(ZZ, 'y')

# Test case 3: Matrix operations
# Type "mat" and it should suggest "matrix"
M = matrix(QQ, [[1, 2], [3, 4]])

# Test case 4: Plotting functions
# Type "pl" and it should suggest "plot"
plot(sin(x), (x, 0, 2*pi))

# Test case 5: Number theory functions
# Type "is_pr" and it should suggest "is_prime"
print(is_prime(17))

# Test case 6: Graph theory
# Type "Gr" and it should suggest "Graph"
G = Graph()

# Test case 7: Elliptic curves
# Type "Ell" and it should suggest "EllipticCurve"
E = EllipticCurve([0, 0, 0, -1, 0])

print("Test file created for manual completion testing")