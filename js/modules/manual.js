/**
 * Module 12: Help, Cryptography Academy, User Manual & Project Report Generator
 * Designed for Course: Network Security (Final Year ECM 2026-27)
 */

export const DocumentationModule = {
    /**
     * Get help and theoretical background for specific cipher
     */
    getCipherTheory(cipherId) {
        const theories = {
            caesar: {
                title: 'Caesar Cipher',
                category: 'Substitution (Monoalphabetic Shift)',
                history: 'Named after Julius Caesar, who used it with a shift of 3 to protect military messages in ~100 BC.',
                formula: 'Encryption: C ≡ (P + k) mod 26\nDecryption: P ≡ (C - k) mod 26',
                cryptanalysis: 'Vulnerable to brute force search (only 25 possible non-trivial keys) and single-letter frequency analysis.',
                instructions: '1. Select shift value (0 to 25).\n2. Enter plaintext.\n3. Click Encrypt or Decrypt.'
            },
            mono: {
                title: 'Monoalphabetic Substitution Cipher',
                category: 'Substitution (Arbitrary Alphabet Permutation)',
                history: 'Formalized by Arab mathematician Al-Kindi in the 9th century in his treatise on cryptanalysis.',
                formula: 'Each plaintext letter maps to a fixed letter in a 26-character shuffled key permutation.',
                cryptanalysis: 'Has a huge keyspace (26! ≈ 4 × 10²⁶), but completely vulnerable to frequency analysis because letter frequencies are preserved.',
                instructions: '1. Provide a 26-letter substitution alphabet or click "Random Key" or "From Keyword".\n2. Enter text and encrypt/decrypt.'
            },
            playfair: {
                title: 'Playfair Cipher',
                category: 'Substitution (Digraphic Polygraphic)',
                history: 'Invented by Charles Wheatstone in 1854, popularized by Lord Playfair. Used by British forces in the Second Boer War and WWI.',
                formula: 'Enciphers pairs of letters (digraphs) on a 5x5 key matrix (I and J share a cell).\n• Same Row: shift right\n• Same Column: shift down\n• Rectangle: swap opposite column corners',
                cryptanalysis: 'Significantly flattens single-letter frequencies (676 digraph pairs), but vulnerable to digraph frequency analysis and known-plaintext attacks.',
                instructions: '1. Enter keyword to construct 5x5 matrix.\n2. Plaintext is automatically converted into pairs with X insertion for repeats.'
            },
            hill: {
                title: 'Hill Cipher',
                category: 'Substitution (Polygraphic Linear Algebra)',
                history: 'Invented by mathematician Lester S. Hill in 1929. The first polygraphic cipher practical on more than three symbols.',
                formula: 'C ≡ P · K (mod 26)\nP ≡ C · K⁻¹ (mod 26)\nwhere K is an n×n matrix with gcd(det(K), 26) = 1.',
                cryptanalysis: 'Completely linear! Vulnerable to Known-Plaintext Attack (KPA) if n plaintext-ciphertext vector pairs are intercepted.',
                instructions: '1. Select 2x2 or 3x3 matrix dimension.\n2. Choose a valid invertible key or use presets.\n3. Verify that det(K) is coprime to 26.'
            },
            vigenere: {
                title: 'Vigenère Cipher',
                category: 'Substitution (Polyalphabetic)',
                history: 'First described by Giovan Battista Bellaso in 1553, misattributed to Blaise de Vigenère. Nicknamed "Le Chiffre Indéchiffrable" for 300 years.',
                formula: 'Cᵢ ≡ (Pᵢ + Kᵢ) mod 26\nPᵢ ≡ (Cᵢ - Kᵢ) mod 26\nwhere key K repeats periodically.',
                cryptanalysis: 'Broken by Friedrich Kasiski (1863) using Kasiski examination and William F. Friedman using the Index of Coincidence.',
                instructions: '1. Enter a secret passphrase/keyword.\n2. Key will repeat across the message.\n3. Inspect the Tabula Recta lookup.'
            },
            otp: {
                title: 'One-Time Pad (Vernam Cipher)',
                category: 'Unconditional Perfect Secrecy',
                history: 'Invented in 1882 by Frank Miller, reinvented in 1917 by Gilbert Vernam. Mathematically proved unbreakable by Claude Shannon in 1949.',
                formula: 'C = P ⊕ K (mod 26 or XOR)\nP = C ⊕ K',
                cryptanalysis: 'Mathematically immune to any brute force or statistical attack provided the key is truly random, never reused, kept secret, and ≥ text length.',
                instructions: '1. Click "Generate Random Pad" to generate a CSPRNG pad.\n2. Choose Modulo 26 or Bitwise XOR mode.'
            },
            railfence: {
                title: 'Rail Fence Cipher',
                category: 'Transposition (Zig-Zag Depth)',
                history: 'Ancient transposition method dating back to the Spartan Scytale and American Civil War communications.',
                formula: 'Plaintext is written downward and upward in a zig-zag trajectory across N rails, then read horizontally rail-by-rail.',
                cryptanalysis: 'Keyspace is small (2 to message length). Easily brute-forced by checking rail counts or searching for anagram patterns.',
                instructions: '1. Select depth (number of rails, 2 to 10).\n2. View the visual zig-zag matrix path.'
            },
            columnar: {
                title: 'Columnar Transposition Cipher',
                category: 'Transposition (Permutation Grid)',
                history: 'Widely used in military telegraphy during WWI and WWII (e.g., German ADFGVX transposition component).',
                formula: 'Text is written row-by-row into a grid of width K (keyword length), then columns are read out in alphabetical order of the key.',
                cryptanalysis: 'Vulnerable to anagramming, multiple anagramming, and bigram frequency analysis.',
                instructions: '1. Enter keyword (e.g. "ZEBRAS").\n2. Inspect the derived column priorities and grid layout.'
            }
        };

        return theories[cipherId] || theories.caesar;
    },

    /**
     * Print the current page / project report
     */
    printReport() {
        window.print();
    }
};
