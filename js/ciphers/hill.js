/**
 * 4. Hill Cipher Implementation (Polygraphic Linear Algebra)
 * Invented by Lester S. Hill (1929)
 * Supports 2x2 and 3x3 matrices with full modular inverse calculation.
 */
import { MathUtils } from '../utils/math-utils.js';

export const HillCipher = {
    name: 'Hill Cipher',
    type: 'Substitution (Matrix / Linear Algebra)',
    historicalPeriod: '1929 (Lester S. Hill)',
    keySpace: 'GL(n, Z₂₆) matrices (≈ 157,248 for 2x2)',

    // Curated known-invertible presets
    presets2x2: [
        { label: 'DDCF (3, 3, 2, 5)', key: 'DDCF', matrix: [[3, 3], [2, 5]] },
        { label: 'BACK (1, 0, 2, 10)', key: 'BACK', matrix: [[1, 0], [2, 10]] },
        { label: 'CDDG (2, 3, 3, 6) - Alt', key: 'EDDF', matrix: [[4, 3], [3, 5]] },
        { label: 'GYBN (6, 24, 1, 13)', key: 'GYBN', matrix: [[6, 24], [1, 13]] }
    ],

    presets3x3: [
        { label: 'GYBNQKURP (Classic 3x3)', key: 'GYBNQKURP', matrix: [[6, 24, 1], [13, 16, 10], [20, 17, 15]] },
        { label: 'ACTBDEFGH (Invertible)', key: 'RRFVSVCCT', matrix: [[17, 17, 5], [21, 18, 21], [2, 2, 19]] }
    ],

    /**
     * Parses keyword or 2D array into matrix
     */
    parseKey(keyInput, size = 2) {
        if (Array.isArray(keyInput)) {
            return keyInput;
        }

        const clean = (keyInput || '').toUpperCase().replace(/[^A-Z]/g, '');
        const expectedLen = size * size;

        if (clean.length < expectedLen) {
            throw new Error(`Hill ${size}x${size} cipher requires a key of at least ${expectedLen} letters (got ${clean.length})`);
        }

        const matrix = [];
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                row.push(clean.charCodeAt(r * size + c) - 65);
            }
            matrix.push(row);
        }
        return matrix;
    },

    /**
     * Inspect and validate matrix invertibility mod 26
     */
    inspectMatrix(matrix) {
        const size = matrix.length;
        const detRaw = size === 2 ? MathUtils.det2x2(matrix) : MathUtils.det3x3(matrix);
        const det = MathUtils.mod(detRaw, 26);
        const gcd = MathUtils.gcd(det, 26);
        const isInvertible = gcd === 1;
        const detInverse = isInvertible ? MathUtils.modInverse(det, 26) : null;
        const inverseMatrix = isInvertible
            ? (size === 2 ? MathUtils.inverseMatrix2x2(matrix) : MathUtils.inverseMatrix3x3(matrix))
            : null;

        return {
            size,
            detRaw,
            det,
            gcd,
            isInvertible,
            detInverse,
            inverseMatrix
        };
    },

    /**
     * Encrypt text using Hill Cipher
     */
    encrypt(text, keyInput, size = 2) {
        const start = performance.now();
        const matrix = this.parseKey(keyInput, size);
        const inspect = this.inspectMatrix(matrix);

        if (!inspect.isInvertible) {
            throw new Error(`Matrix is NOT invertible modulo 26: det = ${inspect.det}, gcd(${inspect.det}, 26) = ${inspect.gcd} ≠ 1. Key cannot be decrypted.`);
        }

        const clean = MathUtils.cleanAlpha(text);
        if (clean.length === 0) {
            return { result: '', steps: [], matrix, inspect, timeMs: 0 };
        }

        // Pad with 'X' to multiple of size
        let padded = clean;
        while (padded.length % size !== 0) {
            padded += 'X';
        }

        const steps = [];
        let result = '';

        for (let i = 0; i < padded.length; i += size) {
            const blockChars = padded.slice(i, i + size);
            const vector = blockChars.split('').map(c => c.charCodeAt(0) - 65);
            const cipherVector = MathUtils.multiplyVectorMatrix(vector, matrix, 26);
            const cipherChars = cipherVector.map(v => String.fromCharCode(65 + v)).join('');

            result += cipherChars;
            steps.push({
                blockIndex: i / size,
                plainChars: blockChars,
                plainVector: vector,
                matrix,
                cipherVector,
                cipherChars
            });
        }

        const timeMs = performance.now() - start;
        return { result, steps, matrix, inspect, timeMs, padded };
    },

    /**
     * Decrypt text using Hill Cipher
     */
    decrypt(ciphertext, keyInput, size = 2) {
        const start = performance.now();
        const matrix = this.parseKey(keyInput, size);
        const inspect = this.inspectMatrix(matrix);

        if (!inspect.isInvertible) {
            throw new Error(`Matrix is NOT invertible modulo 26: det = ${inspect.det}. Cannot decrypt.`);
        }

        const invMatrix = inspect.inverseMatrix;
        const clean = MathUtils.cleanAlpha(ciphertext);
        if (clean.length === 0) {
            return { result: '', steps: [], matrix, inspect, timeMs: 0 };
        }

        let padded = clean;
        while (padded.length % size !== 0) {
            padded += 'X';
        }

        const steps = [];
        let result = '';

        for (let i = 0; i < padded.length; i += size) {
            const blockChars = padded.slice(i, i + size);
            const vector = blockChars.split('').map(c => c.charCodeAt(0) - 65);
            const plainVector = MathUtils.multiplyVectorMatrix(vector, invMatrix, 26);
            const plainChars = plainVector.map(v => String.fromCharCode(65 + v)).join('');

            result += plainChars;
            steps.push({
                blockIndex: i / size,
                cipherChars: blockChars,
                cipherVector: vector,
                invMatrix,
                plainVector,
                plainChars
            });
        }

        const timeMs = performance.now() - start;
        return { result, steps, matrix, inspect, timeMs, padded };
    }
};
