# SageMath Enhanced Test File
# This file demonstrates the enhanced syntax highlighting and LSP features

# Basic symbolic computation
var('x y z')
f = x^2 + 2*x + 1
factor(f)
expand((x+1)^3)
solve(x^2 - 4 == 0, x)

# Ring operations  
R = PolynomialRing(QQ, 'x')
x = R.gen()
p = x^3 + 2*x + 1

# Matrix operations
A = matrix(QQ, [[1, 2], [3, 4]])
B = identity_matrix(QQ, 2)
det(A)
A.eigenvalues()

# Number theory
is_prime(17)
next_prime(100)
gcd(12, 18)
factorial(5)

# Calculus
diff(sin(x), x)
integrate(cos(x), x)
limit(sin(x)/x, x=0)

# Plotting (syntax highlighting test)
plot(sin(x), (x, 0, 2*pi))
plot3d(x^2 + y^2, (x, -2, 2), (y, -2, 2))

# Graph theory
G = Graph()
G.add_vertices([1, 2, 3, 4])
G.add_edges([(1, 2), (2, 3), (3, 4), (4, 1)])

# Elliptic curves
E = EllipticCurve([0, 0, 0, -1, 0])
E.torsion_subgroup()

# Finite fields
F = GF(7)
a = F(3)
a^6

# Modular arithmetic
Mod(17, 5)
power_mod(2, 10, 7)

# Combinatorics
binomial(10, 3)
Permutations(4).list()
Combinations(5, 2).list()

print("SageMath Enhanced test completed!")