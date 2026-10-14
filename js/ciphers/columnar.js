/**
 * 8. Columnar Transposition Cipher Implementation
 * Transposition based on alphabetical permutation of a keyword
 */

export const ColumnarTranspositionCipher = {
    name: 'Columnar Transposition Cipher',
    type: 'Transposition (Permutation Matrix)',
    historicalPeriod: 'WWI / WWII military field ciphers',
    keySpace: 'K! permutations (where K = keyword length)',

    /**
     * Derives column extraction order from key word
     * Returns array of objects with { char, origCol, orderRank }
     */
    getKeyOrder(keyword) {
        const clean = (keyword || '').toUpperCase().replace(/[^A-Z]/g, '');
        if (clean.length === 0) {
            throw new Error('Key must contain at least one alphabetic letter');
        }

        const items = clean.split('').map((char, index) => ({ char, index }));
        // Sort alphabetically, stable sort by index
        items.sort((a, b) => {
            if (a.char < b.char) return -1;
            if (a.char > b.char) return 1;
            return a.index - b.index;
        });

        // Assign ranks 1 to N
        const colRanks = Array(clean.length);
        items.forEach((item, rank) => {
            colRanks[item.index] = rank + 1;
        });

        return {
            cleanKey: clean,
            colCount: clean.length,
            itemsSorted: items,
            colRanks
        };
    },

    /**
     * Encrypt text using Columnar Transposition
     */
    encrypt(text, keyword, padChar = 'X') {
        const start = performance.now();
        const { cleanKey, colCount, itemsSorted, colRanks } = this.getKeyOrder(keyword);

        let processedText = text;
        const remainder = processedText.length % colCount;
        let padCount = 0;
        if (remainder !== 0) {
            padCount = colCount - remainder;
            processedText += padChar.repeat(padCount);
        }

        const numRows = Math.ceil(processedText.length / colCount);
        const grid = [];

        for (let r = 0; r < numRows; r++) {
            const row = [];
            for (let c = 0; c < colCount; c++) {
                row.push(processedText[r * colCount + c] || '');
            }
            grid.push(row);
        }

        // Read columns in sorted key order
        let result = '';
        const columnData = [];

        for (const item of itemsSorted) {
            const cIdx = item.index;
            let colString = '';
            for (let r = 0; r < numRows; r++) {
                colString += grid[r][cIdx];
            }
            columnData.push({
                keyChar: item.char,
                colIndex: cIdx,
                order: colRanks[cIdx],
                content: colString
            });
            result += colString;
        }

        const timeMs = performance.now() - start;
        return {
            result,
            cleanKey,
            grid,
            numRows,
            colCount,
            colRanks,
            columnData,
            padCount,
            timeMs
        };
    },

    /**
     * Decrypt text using Columnar Transposition
     */
    decrypt(ciphertext, keyword, padCount = 0) {
        const start = performance.now();
        const { cleanKey, colCount, itemsSorted, colRanks } = this.getKeyOrder(keyword);
        const len = ciphertext.length;
        const numRows = Math.ceil(len / colCount);

        // Fill grid column-wise in sorted order
        const grid = Array.from({ length: numRows }, () => Array(colCount).fill(''));
        let cipherIdx = 0;

        for (const item of itemsSorted) {
            const cIdx = item.index;
            for (let r = 0; r < numRows; r++) {
                if (cipherIdx < len) {
                    grid[r][cIdx] = ciphertext[cipherIdx++];
                }
            }
        }

        // Read row-by-row
        let result = '';
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < colCount; c++) {
                result += grid[r][c];
            }
        }

        if (padCount > 0 && result.endsWith('X'.repeat(padCount))) {
            result = result.slice(0, -padCount);
        }

        const timeMs = performance.now() - start;
        return {
            result,
            cleanKey,
            grid,
            numRows,
            colCount,
            colRanks,
            timeMs
        };
    }
};
