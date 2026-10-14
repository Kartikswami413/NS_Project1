/**
 * 1. Caesar Cipher Implementation
 * Formula: C = (P + k) mod 26, P = (C - k) mod 26
 */
import { MathUtils } from '../utils/math-utils.js';

export const CaesarCipher = {
    name: 'Caesar Cipher',
    type: 'Substitution',
    historicalPeriod: 'c. 100 BC (Roman Empire)',
    keySpace: '25 possible keys',

    /**
     * Encrypt text using Caesar shift
     * @param {string} text
     * @param {number} key (shift 0-25)
     * @param {boolean} preserveCase
     * @returns {{ result: string, steps: Array, timeMs: number }}
     */
    encrypt(text, key, preserveCase = true) {
        const start = performance.now();
        const shift = MathUtils.mod(parseInt(key, 10) || 0, 26);
        let result = '';
        const steps = [];

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isUpper = ch >= 'A' && ch <= 'Z';
            const isLower = ch >= 'a' && ch <= 'z';

            if (isUpper || isLower) {
                const base = isUpper ? 65 : 97;
                const pVal = ch.charCodeAt(0) - base;
                const cVal = MathUtils.mod(pVal + shift, 26);
                const outChar = preserveCase ? String.fromCharCode(base + cVal) : String.fromCharCode(65 + cVal);
                
                result += outChar;
                steps.push({
                    index: i,
                    original: ch,
                    originalVal: pVal,
                    shift,
                    formula: `(${pVal} + ${shift}) mod 26 = ${cVal}`,
                    resultChar: outChar
                });
            } else {
                result += ch;
                steps.push({
                    index: i,
                    original: ch,
                    originalVal: null,
                    shift,
                    formula: 'Non-alphabetic character preserved',
                    resultChar: ch
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, timeMs, shift };
    },

    /**
     * Decrypt text using Caesar shift
     * @param {string} text
     * @param {number} key (shift 0-25)
     * @param {boolean} preserveCase
     * @returns {{ result: string, steps: Array, timeMs: number }}
     */
    decrypt(text, key, preserveCase = true) {
        const start = performance.now();
        const shift = MathUtils.mod(parseInt(key, 10) || 0, 26);
        let result = '';
        const steps = [];

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isUpper = ch >= 'A' && ch <= 'Z';
            const isLower = ch >= 'a' && ch <= 'z';

            if (isUpper || isLower) {
                const base = isUpper ? 65 : 97;
                const cVal = ch.charCodeAt(0) - base;
                const pVal = MathUtils.mod(cVal - shift, 26);
                const outChar = preserveCase ? String.fromCharCode(base + pVal) : String.fromCharCode(65 + pVal);

                result += outChar;
                steps.push({
                    index: i,
                    original: ch,
                    originalVal: cVal,
                    shift,
                    formula: `(${cVal} - ${shift}) mod 26 = ${pVal}`,
                    resultChar: outChar
                });
            } else {
                result += ch;
                steps.push({
                    index: i,
                    original: ch,
                    originalVal: null,
                    shift,
                    formula: 'Non-alphabetic character preserved',
                    resultChar: ch
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, timeMs, shift };
    },

    /**
     * Brute-force all 25 possible shifts for cryptanalysis
     */
    bruteForce(ciphertext) {
        const candidates = [];
        for (let k = 1; k < 26; k++) {
            const decrypted = this.decrypt(ciphertext, k, true).result;
            candidates.push({ key: k, text: decrypted });
        }
        return candidates;
    }
};
