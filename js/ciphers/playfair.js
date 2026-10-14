/**
 * 3. Playfair Cipher Implementation (5x5 Polygraphic Substitution)
 * Invented by Charles Wheatstone (1854), popularized by Lord Playfair
 */

export const PlayfairCipher = {
    name: 'Playfair Cipher',
    type: 'Substitution (Digraphic)',
    historicalPeriod: '1854 (Victorian Era)',
    keySpace: '≈ 25! / 4 ≈ 3.87 × 10²⁴ matrices',

    /**
     * Generate 5x5 Playfair Key Matrix
     * Combines I and J into I
     */
    generateMatrix(keyword) {
        const clean = (keyword || '').toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        const seen = new Set();
        const letters = [];

        for (const ch of clean) {
            if (!seen.has(ch)) {
                seen.add(ch);
                letters.push(ch);
            }
        }

        // Fill remaining alphabet
        for (let code = 65; code <= 90; code++) {
            const ch = String.fromCharCode(code);
            if (ch === 'J') continue;
            if (!seen.has(ch)) {
                seen.add(ch);
                letters.push(ch);
            }
        }

        const matrix = [];
        const posMap = {};
        for (let r = 0; r < 5; r++) {
            const row = [];
            for (let c = 0; c < 5; c++) {
                const char = letters[r * 5 + c];
                row.push(char);
                posMap[char] = { row: r, col: c };
            }
            matrix.push(row);
        }

        return { matrix, posMap, flatList: letters };
    },

    /**
     * Prepare plaintext into digraph pairs
     */
    preparePlaintext(text) {
        let clean = (text || '').toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        const pairs = [];
        let i = 0;

        while (i < clean.length) {
            const a = clean[i];
            if (i + 1 < clean.length) {
                const b = clean[i + 1];
                if (a === b) {
                    pairs.push([a, 'X']);
                    i += 1;
                } else {
                    pairs.push([a, b]);
                    i += 2;
                }
            } else {
                pairs.push([a, a === 'X' ? 'Z' : 'X']);
                i += 1;
            }
        }

        return pairs;
    },

    /**
     * Encrypt text using Playfair algorithm
     */
    encrypt(text, keyword) {
        const start = performance.now();
        const { matrix, posMap } = this.generateMatrix(keyword);
        const pairs = this.preparePlaintext(text);
        const steps = [];
        let result = '';

        for (const [a, b] of pairs) {
            const posA = posMap[a];
            const posB = posMap[b];
            let outA, outB, rule;

            if (posA.row === posB.row) {
                // Same Row: shift right
                rule = 'Same Row (Shift Right)';
                outA = matrix[posA.row][(posA.col + 1) % 5];
                outB = matrix[posB.row][(posB.col + 1) % 5];
            } else if (posA.col === posB.col) {
                // Same Column: shift down
                rule = 'Same Column (Shift Down)';
                outA = matrix[(posA.row + 1) % 5][posA.col];
                outB = matrix[(posB.row + 1) % 5][posB.col];
            } else {
                // Rectangle rule: swap columns
                rule = 'Rectangle (Corner Swap)';
                outA = matrix[posA.row][posB.col];
                outB = matrix[posB.row][posA.col];
            }

            result += outA + outB;
            steps.push({
                inPair: `${a}${b}`,
                posA,
                posB,
                rule,
                outPair: `${outA}${outB}`
            });
        }

        const timeMs = performance.now() - start;
        return { result, steps, matrix, pairs, timeMs };
    },

    /**
     * Decrypt text using Playfair algorithm
     */
    decrypt(ciphertext, keyword) {
        const start = performance.now();
        const { matrix, posMap } = this.generateMatrix(keyword);
        const clean = (ciphertext || '').toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        
        const pairs = [];
        for (let i = 0; i < clean.length; i += 2) {
            const a = clean[i];
            const b = i + 1 < clean.length ? clean[i + 1] : 'X';
            pairs.push([a, b]);
        }

        const steps = [];
        let result = '';

        for (const [a, b] of pairs) {
            const posA = posMap[a] || { row: 0, col: 0 };
            const posB = posMap[b] || { row: 0, col: 0 };
            let outA, outB, rule;

            if (posA.row === posB.row) {
                // Same Row: shift left
                rule = 'Same Row (Shift Left)';
                outA = matrix[posA.row][(posA.col + 4) % 5];
                outB = matrix[posB.row][(posB.col + 4) % 5];
            } else if (posA.col === posB.col) {
                // Same Column: shift up
                rule = 'Same Column (Shift Up)';
                outA = matrix[(posA.row + 4) % 5][posA.col];
                outB = matrix[(posB.row + 4) % 5][posB.col];
            } else {
                // Rectangle rule: swap columns
                rule = 'Rectangle (Corner Swap)';
                outA = matrix[posA.row][posB.col];
                outB = matrix[posB.row][posA.col];
            }

            result += outA + outB;
            steps.push({
                inPair: `${a}${b}`,
                posA,
                posB,
                rule,
                outPair: `${outA}${outB}`
            });
        }

        const timeMs = performance.now() - start;
        return { result, steps, matrix, pairs, timeMs };
    }
};
