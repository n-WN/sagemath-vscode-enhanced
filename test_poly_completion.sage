# Test file for SageMath completion enhancement
# This file tests the improved completion functionality for "Poly" → "PolynomialRing"

# Test case 1: Simple PolynomialRing completion
# Type "Poly" and it should suggest "PolynomialRing" with high priority
R = Poly

# Test case 2: Assignment context
polynomial_ring = Poly

# Test case 3: Function call context  
sage_compute(Poly

# Test case 4: Multi-line context
def create_polynomial_ring():
    ring = Poly
    return ring

# Test case 5: Comment context (should still work)
# Creating a Poly

print("Completion test file ready for manual testing")
print("Expected behavior: 'Poly' should complete to 'PolynomialRing' with high priority")