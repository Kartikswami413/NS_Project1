/**
 * Module 9: Algorithm Comparison Module
 * Benchmarks all 8 classical ciphers simultaneously
 */
import { CaesarCipher } from '../ciphers/caesar.js';
import { MonoalphabeticCipher } from '../ciphers/monoalphabetic.js';
import { PlayfairCipher } from '../ciphers/playfair.js';
import { HillCipher } from '../ciphers/hill.js';
import { VigenereCipher } from '../ciphers/vigenere.js';
import { OneTimePadCipher } from '../ciphers/onetimepad.js';
import { RailFenceCipher } from '../ciphers/railfence.js';
import { ColumnarTranspositionCipher } from '../ciphers/columnar.js';

export const AlgorithmComparison = {
    /**
     * Run all 8 ciphers on input text with standard representative keys
     */
    compareAll(plaintext) {
        const text = plaintext || 'NETWORK SECURITY';
        const results = [];

        // 1. Caesar Cipher (Key = 5)
        try {
            const res = CaesarCipher.encrypt(text, 5);
            results.push({
                id: 'caesar',
                name: 'Caesar Cipher',
                category: 'Substitution (Monoalphabetic)',
                key: 'Shift = 5',
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'Extremely Weak (Broken)',
                keySpace: '25 keys',
                attack: 'Brute-force (25 attempts) or Frequency Analysis'
            });
        } catch (e) {
            results.push({ name: 'Caesar Cipher', error: e.message });
        }

        // 2. Monoalphabetic Cipher
        try {
            const key = 'QWERTYUIOPASDFGHJKLZXCVBNM';
            const res = MonoalphabeticCipher.encrypt(text, key);
            results.push({
                id: 'mono',
                name: 'Monoalphabetic Cipher',
                category: 'Substitution (Monoalphabetic)',
                key: 'QWERTYUIOPASDFGHJKLZXCVBNM',
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'Weak (Broken)',
                keySpace: '26! ≈ 4.03 × 10²⁶ keys',
                attack: 'Single-letter Frequency Analysis (E, T, A, O, I, N)'
            });
        } catch (e) {
            results.push({ name: 'Monoalphabetic Cipher', error: e.message });
        }

        // 3. Playfair Cipher
        try {
            const key = 'MONARCHY';
            const res = PlayfairCipher.encrypt(text, key);
            results.push({
                id: 'playfair',
                name: 'Playfair Cipher',
                category: 'Substitution (Digraphic)',
                key: 'Keyword: MONARCHY',
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'Moderate-Weak (Historical)',
                keySpace: '≈ 3.87 × 10²⁴ matrices',
                attack: 'Digraph frequency analysis (TH, HE, IN, ER)'
            });
        } catch (e) {
            results.push({ name: 'Playfair Cipher', error: e.message });
        }

        // 4. Hill Cipher (2x2 Matrix "DDCF" -> [[3, 3], [2, 5]])
        try {
            const key = 'DDCF';
            const res = HillCipher.encrypt(text, key, 2);
            results.push({
                id: 'hill',
                name: 'Hill Cipher',
                category: 'Substitution (Polygraphic Matrix)',
                key: 'Matrix: [[3, 3], [2, 5]] ("DDCF")',
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'Moderate (Vulnerable to KPA)',
                keySpace: 'GL(2, Z₂₆) ≈ 157,248 keys',
                attack: 'Known-Plaintext Attack using linear algebra inversion'
            });
        } catch (e) {
            results.push({ name: 'Hill Cipher', error: e.message });
        }

        // 5. Vigenère Cipher
        try {
            const key = 'CRYPTO';
            const res = VigenereCipher.encrypt(text, key);
            results.push({
                id: 'vigenere',
                name: 'Vigenère Cipher',
                category: 'Substitution (Polyalphabetic)',
                key: 'Keyword: CRYPTO',
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'Moderate-Weak (Historical)',
                keySpace: '26⁶ ≈ 3.08 × 10⁸ (for len 6)',
                attack: 'Kasiski examination & Index of Coincidence (Friedman test)'
            });
        } catch (e) {
            results.push({ name: 'Vigenère Cipher', error: e.message });
        }

        // 6. One-Time Pad
        try {
            const pad = OneTimePadCipher.generateRandomPad(text.length);
            const res = OneTimePadCipher.encryptMod26(text, pad);
            results.push({
                id: 'otp',
                name: 'One-Time Pad (Vernam)',
                category: 'Substitution (Unconditional)',
                key: `CSPRNG Random Pad (${pad.slice(0, 10)}...)`,
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'PERFECT SECRECY (Unbreakable)',
                keySpace: 'Infinite (Information-Theoretic)',
                attack: 'Mathematically immune (Shannon’s Theorem: H(M|C) = H(M))'
            });
        } catch (e) {
            results.push({ name: 'One-Time Pad', error: e.message });
        }

        // 7. Rail Fence Cipher
        try {
            const rails = 3;
            const res = RailFenceCipher.encrypt(text, rails);
            results.push({
                id: 'railfence',
                name: 'Rail Fence Cipher',
                category: 'Transposition (Zig-Zag)',
                key: 'Rails = 3',
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'Extremely Weak (Broken)',
                keySpace: 'N - 1 rails',
                attack: 'Brute-force depth testing & Bigram distance search'
            });
        } catch (e) {
            results.push({ name: 'Rail Fence Cipher', error: e.message });
        }

        // 8. Columnar Transposition Cipher
        try {
            const key = 'ZEBRAS';
            const res = ColumnarTranspositionCipher.encrypt(text, key);
            results.push({
                id: 'columnar',
                name: 'Columnar Transposition',
                category: 'Transposition (Permutation)',
                key: 'Keyword: ZEBRAS (Order: 6 2 1 5 3 4)',
                ciphertext: res.result,
                timeMs: res.timeMs,
                security: 'Weak-Moderate',
                keySpace: '6! = 720 permutations',
                attack: 'Anagramming, Multiple anagramming, Bigram matching'
            });
        } catch (e) {
            results.push({ name: 'Columnar Transposition', error: e.message });
        }

        return results;
    }
};
