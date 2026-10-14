/**
 * 6. One-Time Pad (OTP) / Vernam Cipher
 * Information-Theoretic Perfect Secrecy (Shannon, 1949)
 * Supports both Alphabetic Modulo 26 and Binary XOR modes.
 */
import { MathUtils } from '../utils/math-utils.js';

export const OneTimePadCipher = {
    name: 'One-Time Pad (Vernam)',
    type: 'Unconditional Perfect Secrecy',
    historicalPeriod: '1882 (Miller) / 1917 (Vernam)',
    keySpace: '26ᴸ or 2⁸ᴸ (Infinite Information Theoretic)',

    /**
     * Generate cryptographically secure random alphabetic pad of given length
     */
    generateRandomPad(length) {
        if (length <= 0) length = 16;
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomValues = new Uint32Array(length);
        if (typeof window !== 'undefined' && window.crypto) {
            window.crypto.getRandomValues(randomValues);
        } else {
            for (let i = 0; i < length; i++) randomValues[i] = Math.floor(Math.random() * 26);
        }

        let pad = '';
        for (let i = 0; i < length; i++) {
            pad += alphabet[randomValues[i] % 26];
        }
        return pad;
    },

    /**
     * Validate key length for OTP
     */
    validateKey(text, key) {
        const cleanText = text.replace(/[^A-Za-z]/g, '');
        const cleanKey = (key || '').replace(/[^A-Za-z]/g, '');
        if (cleanKey.length < cleanText.length) {
            return {
                valid: false,
                warning: `Key length (${cleanKey.length}) is shorter than alphabetic text length (${cleanText.length}). OTP requires key length ≥ plaintext length for perfect secrecy!`
            };
        }
        return { valid: true };
    },

    /**
     * Encrypt text using Alphabetic Modulo 26 OTP
     */
    encryptMod26(text, key, preserveCase = true) {
        const start = performance.now();
        const cleanKey = (key || '').toUpperCase().replace(/[^A-Z]/g, '');
        const validation = this.validateKey(text, key);

        let result = '';
        const steps = [];
        let keyIdx = 0;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isUpper = ch >= 'A' && ch <= 'Z';
            const isLower = ch >= 'a' && ch <= 'z';

            if (isUpper || isLower) {
                if (keyIdx >= cleanKey.length) {
                    throw new Error(`One-Time Pad exhausted: key is shorter than text. Required at least ${text.length} characters.`);
                }
                const base = isUpper ? 65 : 97;
                const pVal = ch.charCodeAt(0) - base;
                const keyChar = cleanKey[keyIdx];
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
                    formula: 'Preserved symbol',
                    resultChar: ch
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, timeMs, validation };
    },

    /**
     * Decrypt text using Alphabetic Modulo 26 OTP
     */
    decryptMod26(text, key, preserveCase = true) {
        const start = performance.now();
        const cleanKey = (key || '').toUpperCase().replace(/[^A-Z]/g, '');
        let result = '';
        const steps = [];
        let keyIdx = 0;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const isUpper = ch >= 'A' && ch <= 'Z';
            const isLower = ch >= 'a' && ch <= 'z';

            if (isUpper || isLower) {
                if (keyIdx >= cleanKey.length) {
                    throw new Error(`One-Time Pad exhausted: key is shorter than text.`);
                }
                const base = isUpper ? 65 : 97;
                const cVal = ch.charCodeAt(0) - base;
                const keyChar = cleanKey[keyIdx];
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
                    formula: 'Preserved symbol',
                    resultChar: ch
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, timeMs };
    },

    /**
     * Binary XOR Mode (Vernam Cipher)
     * Encrypts/Decrypts bytes and returns hex string or characters
     */
    processXor(text, key) {
        const start = performance.now();
        if (!key || key.length === 0) {
            throw new Error('Key cannot be empty for XOR Vernam cipher');
        }

        let hexResult = '';
        let charResult = '';
        const steps = [];

        for (let i = 0; i < text.length; i++) {
            const pByte = text.charCodeAt(i);
            const kByte = key.charCodeAt(i % key.length);
            const cByte = pByte ^ kByte;

            const hex = cByte.toString(16).padStart(2, '0').toUpperCase();
            hexResult += hex + ' ';
            charResult += String.fromCharCode(cByte);

            steps.push({
                index: i,
                plainChar: text[i],
                pByte,
                pBin: pByte.toString(2).padStart(8, '0'),
                keyChar: key[i % key.length],
                kByte,
                kBin: kByte.toString(2).padStart(8, '0'),
                cByte,
                cBin: cByte.toString(2).padStart(8, '0'),
                hex
            });
        }

        const timeMs = performance.now() - start;
        return {
            hexResult: hexResult.trim(),
            charResult,
            steps,
            timeMs
        };
    }
};
