/**
 * 5. Vigenère Cipher Implementation (Polyalphabetic Substitution)
 * Described by Giovan Battista Bellaso (1553), misattributed to Blaise de Vigenère
 */
import { MathUtils } from '../utils/math-utils.js';

export const VigenereCipher = {
    name: 'Vigenère Cipher',
    type: 'Polyalphabetic Substitution',
    historicalPeriod: '1553 (Le Chiffre Indéchiffrable)',
    keySpace: '26ᴸ keys (L = key length)',

    /**
     * Clean and prepare keyword
     */
    sanitizeKey(key) {
        const clean = (key || '').toUpperCase().replace(/[^A-Z]/g, '');
        if (clean.length === 0) {
            throw new Error('Key must contain at least one alphabetic letter');
        }
        return clean;
    },

    /**
     * Encrypt text using Vigenère cipher
     */
    encrypt(text, key, preserveCase = true) {
        const start = performance.now();
        const cleanKey = this.sanitizeKey(key);
        let result = '';
        const steps = [];
        let keyIdx = 0;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isUpper = ch >= 'A' && ch <= 'Z';
            const isLower = ch >= 'a' && ch <= 'z';

            if (isUpper || isLower) {
                const base = isUpper ? 65 : 97;
                const pVal = ch.charCodeAt(0) - base;
                const keyChar = cleanKey[keyIdx % cleanKey.length];
                const kVal = keyChar.charCodeAt(0) - 65;
                const cVal = MathUtils.mod(pVal + kVal, 26);
                const outChar = preserveCase ? String.fromCharCode(base + cVal) : String.fromCharCode(65 + cVal);

                result += outChar;
                steps.push({
                    index: i,
                    plainChar: ch,
                    keyChar,
                    pVal,
                    kVal,
                    cVal,
                    formula: `(${pVal} + ${kVal}) mod 26 = ${cVal}`,
                    resultChar: outChar
                });

                keyIdx++;
            } else {
                result += ch;
                steps.push({
                    index: i,
                    plainChar: ch,
                    keyChar: '-',
                    pVal: null,
                    kVal: null,
                    cVal: null,
                    formula: 'Non-alphabetic character preserved',
                    resultChar: ch
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, cleanKey, timeMs };
    },

    /**
     * Decrypt text using Vigenère cipher
     */
    decrypt(text, key, preserveCase = true) {
        const start = performance.now();
        const cleanKey = this.sanitizeKey(key);
        let result = '';
        const steps = [];
        let keyIdx = 0;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isUpper = ch >= 'A' && ch <= 'Z';
            const isLower = ch >= 'a' && ch <= 'z';

            if (isUpper || isLower) {
                const base = isUpper ? 65 : 97;
                const cVal = ch.charCodeAt(0) - base;
                const keyChar = cleanKey[keyIdx % cleanKey.length];
                const kVal = keyChar.charCodeAt(0) - 65;
                const pVal = MathUtils.mod(cVal - kVal, 26);
                const outChar = preserveCase ? String.fromCharCode(base + pVal) : String.fromCharCode(65 + pVal);

                result += outChar;
                steps.push({
                    index: i,
                    cipherChar: ch,
                    keyChar,
                    cVal,
                    kVal,
                    pVal,
                    formula: `(${cVal} - ${kVal}) mod 26 = ${pVal}`,
                    resultChar: outChar
                });

                keyIdx++;
            } else {
                result += ch;
                steps.push({
                    index: i,
                    cipherChar: ch,
                    keyChar: '-',
                    cVal: null,
                    kVal: null,
                    pVal: null,
                    formula: 'Non-alphabetic character preserved',
                    resultChar: ch
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, cleanKey, timeMs };
    }
};
