/**
 * 2. Monoalphabetic Substitution Cipher
 * Direct one-to-one mapping between plaintext alphabet and ciphertext alphabet
 */
import { MathUtils } from '../utils/math-utils.js';

export const MonoalphabeticCipher = {
    name: 'Monoalphabetic Cipher',
    type: 'Substitution',
    historicalPeriod: 'c. 9th Century (Al-Kindi)',
    keySpace: '26! ≈ 4.03 × 10²⁶ keys',

    /**
     * Validate key has 26 unique letters A-Z
     */
    validateKey(key) {
        const clean = (key || '').toUpperCase().replace(/[^A-Z]/g, '');
        if (clean.length !== 26) {
            return { valid: false, error: `Key must contain exactly 26 letters (currently ${clean.length})` };
        }
        const uniqueSet = new Set(clean.split(''));
        if (uniqueSet.size !== 26) {
            return { valid: false, error: 'Key contains duplicate letters' };
        }
        return { valid: true, cleanKey: clean };
    },

    /**
     * Generate a random permutation of the alphabet
     */
    generateRandomKey() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    },

    /**
     * Generate key from a keyword (e.g. "ZEBRA" -> "ZEBRACDFGHIJKLMNOPQSTUVWXY")
     */
    generateFromKeyword(keyword) {
        const clean = (keyword || '').toUpperCase().replace(/[^A-Z]/g, '');
        const seen = new Set();
        let key = '';
        for (const ch of clean) {
            if (!seen.has(ch)) {
                seen.add(ch);
                key += ch;
            }
        }
        for (let code = 65; code <= 90; code++) {
            const ch = String.fromCharCode(code);
            if (!seen.has(ch)) {
                key += ch;
            }
        }
        return key;
    },

    /**
     * Encrypt text
     */
    encrypt(text, key, preserveCase = true) {
        const start = performance.now();
        const val = this.validateKey(key);
        if (!val.valid) {
            throw new Error(val.error);
        }

        const cipherAlpha = val.cleanKey;
        const plainAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const map = {};
        for (let i = 0; i < 26; i++) {
            map[plainAlpha[i]] = cipherAlpha[i];
        }

        let result = '';
        const steps = [];

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const upper = ch.toUpperCase();
            if (map[upper]) {
                const mapped = map[upper];
                const outChar = preserveCase ? MathUtils.applyCasePreserving(ch, mapped) : mapped;
                result += outChar;
                steps.push({
                    index: i,
                    original: ch,
                    mapped: outChar,
                    isAlpha: true
                });
            } else {
                result += ch;
                steps.push({
                    index: i,
                    original: ch,
                    mapped: ch,
                    isAlpha: false
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, timeMs, map };
    },

    /**
     * Decrypt text
     */
    decrypt(text, key, preserveCase = true) {
        const start = performance.now();
        const val = this.validateKey(key);
        if (!val.valid) {
            throw new Error(val.error);
        }

        const cipherAlpha = val.cleanKey;
        const plainAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const reverseMap = {};
        for (let i = 0; i < 26; i++) {
            reverseMap[cipherAlpha[i]] = plainAlpha[i];
        }

        let result = '';
        const steps = [];

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const upper = ch.toUpperCase();
            if (reverseMap[upper]) {
                const mapped = reverseMap[upper];
                const outChar = preserveCase ? MathUtils.applyCasePreserving(ch, mapped) : mapped;
                result += outChar;
                steps.push({
                    index: i,
                    original: ch,
                    mapped: outChar,
                    isAlpha: true
                });
            } else {
                result += ch;
                steps.push({
                    index: i,
                    original: ch,
                    mapped: ch,
                    isAlpha: false
                });
            }
        }

        const timeMs = performance.now() - start;
        return { result, steps, timeMs, reverseMap };
    }
};
