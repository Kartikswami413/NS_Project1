/**
 * Cryptanalysis & Frequency Analysis Utility
 * Calculates letter distribution and Index of Coincidence (Friedman Test)
 */

export const FrequencyAnalysis = {
    // Standard English letter frequencies (%)
    englishFrequencies: {
        'A': 8.17, 'B': 1.49, 'C': 2.78, 'D': 4.25, 'E': 12.70, 'F': 2.23,
        'G': 2.02, 'H': 6.09, 'I': 6.97, 'J': 0.15, 'K': 0.77, 'L': 4.03,
        'M': 2.41, 'N': 6.75, 'O': 7.51, 'P': 1.93, 'Q': 0.10, 'R': 5.99,
        'S': 6.33, 'T': 9.06, 'U': 2.76, 'V': 0.98, 'W': 2.36, 'X': 0.15,
        'Y': 1.97, 'Z': 0.07
    },

    /**
     * Analyze text letter frequencies and Index of Coincidence
     */
    analyze(text) {
        const clean = (text || '').toUpperCase().replace(/[^A-Z]/g, '');
        const total = clean.length;
        const counts = {};
        for (let c = 65; c <= 90; c++) counts[String.fromCharCode(c)] = 0;

        for (const ch of clean) {
            counts[ch] = (counts[ch] || 0) + 1;
        }

        const data = [];
        let sumProduct = 0;

        for (let c = 65; c <= 90; c++) {
            const letter = String.fromCharCode(c);
            const count = counts[letter];
            const pct = total > 0 ? (count / total) * 100 : 0;
            const engPct = this.englishFrequencies[letter];
            sumProduct += count * (count - 1);

            data.push({
                letter,
                count,
                percentage: pct,
                englishPct: engPct,
                difference: pct - engPct
            });
        }

        // Index of Coincidence (IoC)
        const ioc = total > 1 ? sumProduct / (total * (total - 1)) : 0;

        let diagnosis = 'Insufficient data';
        if (total >= 20) {
            if (ioc >= 0.060) {
                diagnosis = 'Likely Monoalphabetic Substitution or Transposition Cipher (IoC close to standard English ~0.066)';
            } else if (ioc >= 0.045) {
                diagnosis = 'Likely Polyalphabetic Cipher with short key period or mixed structure';
            } else {
                diagnosis = 'Likely Polyalphabetic Cipher with long key (e.g. Vigenère) or Random Pad / OTP (IoC ~0.038)';
            }
        }

        return {
            totalLetters: total,
            frequencies: data,
            ioc: ioc.toFixed(4),
            diagnosis
        };
    }
};
