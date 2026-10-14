# Classical Cryptography Toolkit
**Course:** Network Security  
**Class:** Final Year (ECM) 2026-27  
**Mini Project 1:** Design and Development of a Classical Cryptography Toolkit  
**Architecture:** Pure UI-Based Frontend Web Application (Zero Backend Required)

---

## 🚀 Quick Start Guide

This project is completely client-side and requires **no backend or database**. You can run it immediately using any of the following methods:

### Method 1: Local HTTP Server (Recommended)
Open a terminal in the project directory and run:
```bash
# Using Python:
python -m http.server 8000

# OR using Node.js:
npx serve .
```
Then open your web browser at: **`http://localhost:8000`**

### Method 2: Direct Browser Launch
Simply double-click [index.html](file:///e:/NS_Project1/index.html) in your file explorer to open it directly in Chrome, Edge, Firefox, or Brave.

---

## 📋 Implemented Menu Modules (Per Specification)

The toolkit strictly implements the 13 modules specified in `Mini Project1.docx`:

### 🔐 Substitution Ciphers
1. **Caesar Cipher**
   - Formula: $C = (P + k) \pmod{26}$, $P = (C - k) \pmod{26}$
   - Key shift slider (0–25) with dynamic wheel visualization
   - Official test case verification: `"NETWORK SECURITY"` with key `5` $\to$ `"SJYBTWP XJHZWNYD"`
2. **Monoalphabetic Cipher**
   - Arbitrary alphabet substitution with keyspace $26! \approx 4.03 \times 10^{26}$
   - Features: Random key generator, keyword generator (e.g., `"ZEBRAS"`), 1-to-1 visual mapping grid
3. **Playfair Cipher**
   - 5×5 matrix polygraphic cipher (I/J combined)
   - Digraph pair generation with `'X'` filler insertion
   - Interactive rule inspector: Same row (shift right), same column (shift down), rectangle (corner swap)
4. **Hill Cipher**
   - Linear algebra polygraphic cipher: $\vec{C} = \vec{P} \cdot K \pmod{26}$, $\vec{P} = \vec{C} \cdot K^{-1} \pmod{26}$
   - Supports 2×2 and 3×3 matrices
   - Real-time modular determinant calculation, $\gcd(\det, 26) = 1$ validation, and modular inverse matrix computation
   - Pre-configured valid invertible keys (e.g., `"DDCF"`, `"BACK"`, `"GYBN"`) and random invertible key generator
5. **Vigenère Cipher (Polyalphabetic)**
   - Formula: $C_i = (P_i + K_i) \pmod{26}$
   - Repeated keystream alignment ribbon and interactive Tabula Recta
6. **One-Time Pad (Vernam)**
   - Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) pad generation
   - Claude Shannon Information-Theoretic Perfect Secrecy validation
   - Dual modes: Modulo 26 and Bitwise XOR (Binary/Hexadecimal)

### 🔀 Transposition Ciphers
7. **Rail Fence Cipher**
   - Depth rails slider (2 to 10 rails)
   - Dynamic 2D zig-zag rail grid visualization
8. **Columnar Transposition Cipher**
   - Keyword permutation order ranking (e.g., `"ZEBRAS"` $\to$ `5 2 1 4 3 6`)
   - 2D matrix assembly and column read-out visualizer

### 🛠️ Utility Modules
9. **Compare Algorithms**
   - Side-by-side benchmark of all 8 algorithms on identical input
   - Metrics: Execution time ($\mu\text{s}$), ciphertext length, keyspace size, security rating, primary cryptanalysis attack
10. **Encrypt Text File**
    - Drag-and-drop file upload (`.txt`, `.csv`, `.log`)
    - Select algorithm and key to encrypt file content
11. **Decrypt Text File**
    - Load encrypted text files, decrypt, and download result file
12. **Help & Project Report**
    - Interactive Cryptography Academy explaining historical context and mathematics
    - Built-in complete Mini Project Report with one-click **Print / Save PDF**
13. **Exit / Toolkit Lock**
    - Master password protection screen (Default password: `admin`)

---

## 🌟 Bonus & Advanced Features Included

- [x] **State-of-the-art UI/UX**: Futuristic cyber/glassmorphism design system using CSS variables, glowing neon accents, and modern typography (Outfit, Inter, Fira Code).
- [x] **File I/O**: Load text from `.txt` files and save encrypted output with one click.
- [x] **Microsecond Execution Timing**: High-precision benchmark using `performance.now()`.
- [x] **Random Key Generation**: Caesar, Monoalphabetic, Hill matrix, and One-Time Pad generators.
- [x] **Key Validation & Error Handling**: Real-time alerts for non-invertible Hill matrices, missing letters, or invalid lengths.
- [x] **Master Password Gate**: Session security and toolkit locking with passcode protection.
- [x] **Interactive Frequency Analysis**: Dynamic bar chart comparing ciphertext letter distribution with standard English (`ETAOIN SHRDLU`) and calculating the Index of Coincidence (IoC).
- [x] **Synthesized Web Audio FX**: Subtle sound feedback for clicks, success, and error alerts.

---

## 📂 Project Directory Structure

```
e:/NS_Project1/
├── index.html                  # Single Page Application entry point
├── README.md                   # Project documentation & user guide
├── Mini Project1.docx          # Original project requirements document
├── css/
│   ├── style.css               # Core design tokens, layout & card styles
│   ├── ciphers.css             # Matrix, rail fence & visualizer styling
│   └── responsive.css          # Mobile responsiveness & print report styles
└── js/
    ├── app.js                  # Master SPA application controller
    ├── ciphers/
    │   ├── caesar.js           # 1. Caesar Cipher logic
    │   ├── monoalphabetic.js   # 2. Monoalphabetic substitution
    │   ├── playfair.js         # 3. Playfair 5x5 cipher
    │   ├── hill.js             # 4. Hill linear algebra cipher
    │   ├── vigenere.js         # 5. Vigenère cipher
    │   ├── onetimepad.js       # 6. One-Time Pad / Vernam
    │   ├── railfence.js        # 7. Rail Fence transposition
    │   └── columnar.js         # 8. Columnar transposition
    ├── modules/
    │   ├── comparison.js       # 9. Algorithm comparison engine
    │   ├── file-handler.js     # 10 & 11. Text file encrypt/decrypt
    │   ├── manual.js           # 12. Academy & project report
    │   ├── frequency.js        # Bonus: Frequency cryptanalysis & IoC
    │   └── security-lock.js    # 13 & Bonus: Password protection
    └── utils/
        ├── math-utils.js       # Modular arithmetic, extended GCD & matrix inverse
        └── ui-helpers.js       # Audio synthesizer, toasts & clipboard helpers
```

---

## 📊 Sample Test Verification

Per the specification in `Mini Project1.docx`:

| Field | Value | Status |
|---|---|---|
| **Plaintext** | `NETWORK SECURITY` | Input |
| **Cipher** | Caesar Cipher | Selected |
| **Key** | `5` | Shift |
| **Encrypted Text** | `SJYBTWP XJHZWNYD` | ✅ Verified Exact Match |
| **Decrypted Text** | `NETWORK SECURITY` | ✅ Verified Roundtrip Match |

---

## 🎓 Deliverables Summary (For Academic Submission)

1. **Source Code**: Clean, modular HTML5/CSS3/ES6 JavaScript codebase with zero external backend dependencies.
2. **Project Report**: Accessible in the web application via Module 12 or printable using the "Print / Save as PDF" button.
3. **Presentation Outline**: Included in the documentation module and report view.
4. **User Manual**: Built into the Help section of the application.
