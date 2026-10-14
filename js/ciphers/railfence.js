/**
 * 7. Rail Fence (Zig-Zag) Cipher Implementation
 * Classical Transposition Cipher
 */

export const RailFenceCipher = {
    name: 'Rail Fence Cipher',
    type: 'Transposition (Zig-Zag Path)',
    historicalPeriod: 'Ancient Greece (Spartan Scytale analog) / American Civil War',
    keySpace: 'N - 1 rails (where N = message length)',

    /**
     * Encrypt text using Rail Fence
     */
    encrypt(text, rails) {
        const start = performance.now();
        const numRails = Math.max(2, parseInt(rails, 10) || 2);
        const len = text.length;

        if (len === 0 || numRails <= 1) {
            return { result: text, grid: [], timeMs: 0, numRails };
        }

        // Initialize 2D grid with nulls
        const grid = Array.from({ length: numRails }, () => Array(len).fill(null));

        let rail = 0;
        let directionDown = true;

        for (let col = 0; col < len; col++) {
            grid[rail][col] = text[col];

            if (rail === 0) {
                directionDown = true;
            } else if (rail === numRails - 1) {
                directionDown = false;
            }

            rail += directionDown ? 1 : -1;
        }

        // Read row by row
        let result = '';
        const railBreakdown = [];

        for (let r = 0; r < numRails; r++) {
            let rowChars = '';
            for (let c = 0; c < len; c++) {
                if (grid[r][c] !== null) {
                    rowChars += grid[r][c];
                    result += grid[r][c];
                }
            }
            railBreakdown.push({ rail: r + 1, characters: rowChars });
        }

        const timeMs = performance.now() - start;
        return { result, grid, railBreakdown, numRails, timeMs };
    },

    /**
     * Decrypt text using Rail Fence
     */
    decrypt(ciphertext, rails) {
        const start = performance.now();
        const numRails = Math.max(2, parseInt(rails, 10) || 2);
        const len = ciphertext.length;

        if (len === 0 || numRails <= 1) {
            return { result: ciphertext, grid: [], timeMs: 0, numRails };
        }

        // 1. Mark zig-zag positions with placeholder '*'
        const grid = Array.from({ length: numRails }, () => Array(len).fill(null));
        let rail = 0;
        let directionDown = true;

        for (let col = 0; col < len; col++) {
            grid[rail][col] = '*';

            if (rail === 0) {
                directionDown = true;
            } else if (rail === numRails - 1) {
                directionDown = false;
            }

            rail += directionDown ? 1 : -1;
        }

        // 2. Fill the marked positions row by row from ciphertext
        let cipherIdx = 0;
        for (let r = 0; r < numRails; r++) {
            for (let c = 0; c < len; c++) {
                if (grid[r][c] === '*' && cipherIdx < len) {
                    grid[r][c] = ciphertext[cipherIdx++];
                }
            }
        }

        // 3. Read in zig-zag order to reconstruct plaintext
        let result = '';
        rail = 0;
        directionDown = true;

        for (let col = 0; col < len; col++) {
            result += grid[rail][col];

            if (rail === 0) {
                directionDown = true;
            } else if (rail === numRails - 1) {
                directionDown = false;
            }

            rail += directionDown ? 1 : -1;
        }

        const timeMs = performance.now() - start;
        return { result, grid, numRails, timeMs };
    }
};
