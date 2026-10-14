/**
 * Mathematical Utilities for Classical Cryptography Toolkit
 * Course: Network Security (Final Year ECM 2026-27)
 */

export const MathUtils = {
    /**
     * Standard mathematical modulo that handles negative numbers correctly.
     * @param {number} n
     * @param {number} m
     * @returns {number}
     */
    mod(n, m) {
        return ((n % m) + m) % m;
    },

    /**
     * Greatest Common Divisor using Euclidean algorithm
     * @param {number} a
     * @param {number} b
     * @returns {number}
     */
    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    },

    /**
     * Extended Euclidean Algorithm
     * Returns [g, x, y] such that a*x + b*y = g = gcd(a, b)
     */
    extendedGcd(a, b) {
        if (b === 0) return [a, 1, 0];
        const [g, x1, y1] = this.extendedGcd(b, a % b);
        const x = y1;
        const y = x1 - Math.floor(a / b) * y1;
        return [g, x, y];
    },

    /**
     * Finds modular multiplicative inverse of a mod m:
     * a * x ≡ 1 (mod m)
     * Returns null if inverse does not exist (i.e. gcd(a, m) !== 1)
     */
    modInverse(a, m = 26) {
        a = this.mod(a, m);
        const [g, x] = this.extendedGcd(a, m);
        if (g !== 1) {
            return null; // No inverse exists
        }
        return this.mod(x, m);
    },

    /**
     * Computes determinant of 2x2 matrix
     * [[a, b], [c, d]]
     */
    det2x2(matrix) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    },

    /**
     * Computes determinant of 3x3 matrix
     */
    det3x3(matrix) {
        const m = matrix;
        return (
            m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
            m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
            m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
        );
    },

    /**
     * Computes modular inverse matrix of 2x2 matrix modulo m (default 26)
     */
    inverseMatrix2x2(matrix, m = 26) {
        const det = this.mod(this.det2x2(matrix), m);
        const detInv = this.modInverse(det, m);
        if (detInv === null) return null;

        // Adjugate of [[a, b], [c, d]] is [[d, -b], [-c, a]]
        const adj = [
            [matrix[1][1], -matrix[0][1]],
            [-matrix[1][0], matrix[0][0]]
        ];

        return adj.map(row =>
            row.map(val => this.mod(val * detInv, m))
        );
    },

    /**
     * Computes modular inverse matrix of 3x3 matrix modulo m (default 26)
     */
    inverseMatrix3x3(matrix, m = 26) {
        const det = this.mod(this.det3x3(matrix), m);
        const detInv = this.modInverse(det, m);
        if (detInv === null) return null;

        const m00 = matrix[0][0], m01 = matrix[0][1], m02 = matrix[0][2];
        const m10 = matrix[1][0], m11 = matrix[1][1], m12 = matrix[1][2];
        const m20 = matrix[2][0], m21 = matrix[2][1], m22 = matrix[2][2];

        // Cofactor matrix transposed (adjugate)
        const adj = [
            [
                (m11 * m22 - m12 * m21),
                -(m01 * m22 - m02 * m21),
                (m01 * m12 - m02 * m11)
            ],
            [
                -(m10 * m22 - m12 * m20),
                (m00 * m22 - m02 * m20),
                -(m00 * m12 - m02 * m10)
            ],
            [
                (m10 * m21 - m11 * m20),
                -(m00 * m21 - m01 * m20),
                (m00 * m11 - m01 * m10)
            ]
        ];

        return adj.map(row =>
            row.map(val => this.mod(val * detInv, m))
        );
    },

    /**
     * Multiply vector by matrix modulo m: result = vector * matrix (mod m)
     * For Hill cipher: row vector [p1, p2, ...] * matrix
     */
    multiplyVectorMatrix(vector, matrix, m = 26) {
        const result = [];
        const size = matrix.length;
        for (let col = 0; col < size; col++) {
            let sum = 0;
            for (let row = 0; row < size; row++) {
                sum += vector[row] * matrix[row][col];
            }
            result.push(this.mod(sum, m));
        }
        return result;
    },

    /**
     * Generate random invertible 2x2 matrix modulo 26
     */
    generateRandomInvertible2x2() {
        for (let attempt = 0; attempt < 500; attempt++) {
            const m = [
                [Math.floor(Math.random() * 26), Math.floor(Math.random() * 26)],
                [Math.floor(Math.random() * 26), Math.floor(Math.random() * 26)]
            ];
            const det = this.mod(this.det2x2(m), 26);
            if (this.gcd(det, 26) === 1) {
                return m;
            }
        }
        // Fallback known valid matrix
        return [[3, 3], [2, 5]];
    },

    /**
     * Clean text to uppercase letters only
     */
    cleanAlpha(text) {
        return (text || '').toUpperCase().replace(/[^A-Z]/g, '');
    },

    /**
     * Preserves casing and non-alphabetic characters during substitution
     */
    applyCasePreserving(origChar, transformedUpper) {
        if (origChar >= 'A' && origChar <= 'Z') return transformedUpper;
        if (origChar >= 'a' && origChar <= 'z') return transformedUpper.toLowerCase();
        return origChar;
    }
};
