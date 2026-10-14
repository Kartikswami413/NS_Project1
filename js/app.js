/**
 * Classical Cryptography Toolkit - Master Controller Application
 * Course: Network Security (Final Year ECM 2026-27)
 */

import { CaesarCipher } from './ciphers/caesar.js';
import { MonoalphabeticCipher } from './ciphers/monoalphabetic.js';
import { PlayfairCipher } from './ciphers/playfair.js';
import { HillCipher } from './ciphers/hill.js';
import { VigenereCipher } from './ciphers/vigenere.js';
import { OneTimePadCipher } from './ciphers/onetimepad.js';
import { RailFenceCipher } from './ciphers/railfence.js';
import { ColumnarTranspositionCipher } from './ciphers/columnar.js';

import { AlgorithmComparison } from './modules/comparison.js';
import { FileHandler } from './modules/file-handler.js';
import { FrequencyAnalysis } from './modules/frequency.js';
import { SecurityLock } from './modules/security-lock.js';
import { DocumentationModule } from './modules/manual.js';
import { Toast, sound, copyText, formatExecutionTime } from './utils/ui-helpers.js';
import { MathUtils } from './utils/math-utils.js';

class CryptographyApp {
    constructor() {
        this.activeCipher = 'caesar';
        this.activeTab = 'visualizer';
        this.lastEncryptResult = null;
        this.lastDecryptResult = null;
        this.init();
    }

    init() {
        this.bindNavigation();
        this.bindGlobalActions();
        this.bindFileEvents();
        this.setupCipherKeyControls(this.activeCipher);
        this.runSampleTest();
        SecurityLock.init();
    }

    /* -------------------------------------------------------------------------
       NAVIGATION & MODULE SWITCHING
       ------------------------------------------------------------------------- */
    bindNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                sound.playClick();
                const cipherKey = item.getAttribute('data-cipher');
                this.switchModule(cipherKey);
            });
        });

        // Mobile drawer toggle
        const mobileToggle = document.getElementById('mobile-toggle');
        const sidebar = document.getElementById('sidebar');
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }
    }

    switchModule(moduleKey) {
        // Handle Exit / Lock specifically
        if (moduleKey === 'exit') {
            SecurityLock.lock();
            return;
        }

        // Close mobile drawer if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');

        // Update active menu state
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-cipher') === moduleKey);
        });

        const studioContainer = document.getElementById('cipher-studio-container');
        const compareView = document.getElementById('module-compare-view');
        const fileView = document.getElementById('module-file-view');
        const helpView = document.getElementById('module-help-view');
        const heroBanner = document.getElementById('view-hero');

        // Hide all views first
        studioContainer.classList.add('hidden');
        compareView.classList.add('hidden');
        fileView.classList.add('hidden');
        helpView.classList.add('hidden');
        heroBanner.classList.remove('hidden');

        const titles = {
            caesar: { title: 'Caesar Cipher', category: 'Substitution', desc: 'Monoalphabetic shift cipher where each letter is shifted by a fixed key k.', keyspace: '25 keys', era: 'c. 100 BC' },
            mono: { title: 'Monoalphabetic Substitution', category: 'Substitution', desc: 'Arbitrary permutation substitution where each plaintext letter maps to a unique letter.', keyspace: '26! ≈ 4.03×10²⁶', era: '9th Century' },
            playfair: { title: 'Playfair Cipher', category: 'Substitution (Digraphic)', desc: 'Encrypts letter pairs (digraphs) on a 5×5 key matrix using row, column, and rectangle rules.', keyspace: '≈ 3.87×10²⁴', era: '1854' },
            hill: { title: 'Hill Cipher (Matrix)', category: 'Substitution (Linear Algebra)', desc: 'Polygraphic cipher using modular matrix multiplication C = P·K (mod 26). Requires gcd(det, 26) = 1.', keyspace: 'GL(n, Z₂₆)', era: '1929' },
            vigenere: { title: 'Vigenère Cipher', category: 'Polyalphabetic', desc: 'Periodic polyalphabetic cipher using repeated keyword shifts and Tabula Recta.', keyspace: '26ᴸ keys', era: '1553' },
            otp: { title: 'One-Time Pad (Vernam)', category: 'Unconditional Perfect Secrecy', desc: 'CSPRNG pad matching message length. Proved unbreakable by Claude Shannon in 1949.', keyspace: 'Infinite (Shannon)', era: '1882 / 1917' },
            railfence: { title: 'Rail Fence Cipher', category: 'Transposition (Zig-Zag)', desc: 'Transposition along a zig-zag trajectory across N depth rails, read horizontally.', keyspace: 'N - 1 rails', era: 'Ancient Greece' },
            columnar: { title: 'Columnar Transposition', category: 'Transposition (Permutation)', desc: 'Writes text into rows of width K, reading columns in alphabetical keyword order.', keyspace: 'K! permutations', era: 'WWI / WWII' },
            compare: { title: 'Compare Algorithms', category: 'Utility Module', desc: 'Comprehensive side-by-side performance and security benchmark of all 8 classical ciphers.', keyspace: 'Comparative', era: 'Toolkit Suite' },
            'file-encrypt': { title: 'Encrypt Text File', category: 'File Utility', desc: 'Load text file, encrypt with chosen algorithm, and download result file.', keyspace: 'File I/O', era: 'Toolkit Suite' },
            'file-decrypt': { title: 'Decrypt Text File', category: 'File Utility', desc: 'Load encrypted file, decrypt with appropriate cipher and key, and download result.', keyspace: 'File I/O', era: 'Toolkit Suite' },
            help: { title: 'Help & Project Documentation', category: 'Documentation', desc: 'Academic mini project report, system architecture flowchart, algorithms, and user manual.', keyspace: 'Academic', era: '2026-27' }
        };

        const info = titles[moduleKey] || titles.caesar;
        document.getElementById('topbar-title').textContent = info.title;
        document.getElementById('topbar-category').textContent = info.category;
        document.getElementById('hero-title').innerHTML = `<i class="fa-solid fa-cube"></i> ${info.title}`;
        document.getElementById('hero-desc').textContent = info.desc;
        document.getElementById('stat-keyspace').textContent = info.keyspace;
        document.getElementById('stat-era').textContent = info.era;

        if (moduleKey === 'compare') {
            compareView.classList.remove('hidden');
            this.runAlgorithmComparison();
        } else if (moduleKey === 'file-encrypt' || moduleKey === 'file-decrypt') {
            fileView.classList.remove('hidden');
            document.getElementById('file-module-title').textContent = moduleKey === 'file-encrypt' ? 'Encrypt Text File' : 'Decrypt Text File';
        } else if (moduleKey === 'help') {
            helpView.classList.remove('hidden');
            this.renderDocumentation('report');
        } else {
            studioContainer.classList.remove('hidden');
            this.activeCipher = moduleKey;
            this.setupCipherKeyControls(moduleKey);
            this.executeEncrypt();
        }
    }

    /* -------------------------------------------------------------------------
       DYNAMIC KEY CONTROLS PER CIPHER
       ------------------------------------------------------------------------- */
    setupCipherKeyControls(cipherKey) {
        const container = document.getElementById('cipher-key-container');
        if (!container) return;

        let html = '';
        switch (cipherKey) {
            case 'caesar':
                html = `
                    <div class="form-label">
                        <span>Caesar Shift Key (0 - 25)</span>
                        <span class="hint">Standard Caesar k = 3 or 5</span>
                    </div>
                    <div class="range-slider-group">
                        <input type="range" id="caesar-slider" class="range-slider" min="0" max="25" value="5">
                        <span class="range-val-badge" id="caesar-val-badge">5</span>
                    </div>
                `;
                break;

            case 'mono':
                html = `
                    <div class="form-label">
                        <span>26-Letter Substitution Alphabet</span>
                        <span class="hint" id="mono-val-hint">Must contain all 26 distinct letters</span>
                    </div>
                    <input type="text" id="mono-key-input" class="input-field mono-input" value="QWERTYUIOPASDFGHJKLZXCVBNM" maxlength="26">
                    <div class="preset-bar" style="margin-top: 10px;">
                        <button class="btn btn-secondary btn-sm" id="btn-mono-random"><i class="fa-solid fa-shuffle"></i> Random Key</button>
                        <button class="btn btn-secondary btn-sm" id="btn-mono-keyword"><i class="fa-solid fa-font"></i> From Keyword ("ZEBRAS")</button>
                        <button class="btn btn-secondary btn-sm" id="btn-mono-reset"><i class="fa-solid fa-arrow-rotate-left"></i> A-Z Standard</button>
                    </div>
                `;
                break;

            case 'playfair':
                html = `
                    <div class="form-label">
                        <span>Playfair Keyword (I & J Merged)</span>
                        <span class="hint">Duplicate letters auto-removed</span>
                    </div>
                    <input type="text" id="playfair-key-input" class="input-field mono-input" value="MONARCHY" placeholder="Enter keyword...">
                    <div class="preset-bar" style="margin-top: 8px;">
                        <span class="preset-chip" data-pf="MONARCHY">MONARCHY</span>
                        <span class="preset-chip" data-pf="PLAYFAIR EXAMPLE">PLAYFAIR EXAMPLE</span>
                        <span class="preset-chip" data-pf="GUIDANCE">GUIDANCE</span>
                    </div>
                `;
                break;

            case 'hill':
                html = `
                    <div class="form-label">
                        <span>Hill Cipher Matrix Dimension & Key</span>
                        <span class="hint">Key must satisfy gcd(det, 26) = 1</span>
                    </div>
                    <div style="display:flex; gap: 12px; margin-bottom: 12px;">
                        <select id="hill-dimension-select" class="select-field" style="max-width: 140px;">
                            <option value="2" selected>2 × 2 Matrix</option>
                            <option value="3">3 × 3 Matrix</option>
                        </select>
                        <select id="hill-presets-select" class="select-field">
                            <option value="DDCF" selected>Preset: DDCF [ [3, 3], [2, 5] ] (det=9, inv=3)</option>
                            <option value="BACK">Preset: BACK [ [1, 0], [2, 10] ]</option>
                            <option value="GYBN">Preset: GYBN [ [6, 24], [1, 13] ]</option>
                            <option value="GYBNQKURP">Preset 3x3: GYBNQKURP</option>
                        </select>
                    </div>
                    <div id="hill-matrix-interactive" style="display: flex; align-items: center; gap: 16px;">
                        <div class="matrix-bracket-wrap">
                            <div class="matrix-grid-2x2" id="hill-matrix-grid">
                                <input type="number" class="matrix-cell-input" id="m00" value="3">
                                <input type="number" class="matrix-cell-input" id="m01" value="3">
                                <input type="number" class="matrix-cell-input" id="m10" value="2">
                                <input type="number" class="matrix-cell-input" id="m11" value="5">
                            </div>
                        </div>
                        <div id="hill-det-indicator" class="invertible-status status-valid">
                            <i class="fa-solid fa-circle-check"></i> Invertible Mod 26 (det = 9)
                        </div>
                    </div>
                    <div class="preset-bar" style="margin-top: 10px;">
                        <button class="btn btn-secondary btn-sm" id="btn-hill-random"><i class="fa-solid fa-dice"></i> Generate Invertible Matrix</button>
                    </div>
                `;
                break;

            case 'vigenere':
                html = `
                    <div class="form-label">
                        <span>Vigenère Passphrase / Keyword</span>
                        <span class="hint">Repeats cyclically across plaintext</span>
                    </div>
                    <input type="text" id="vigenere-key-input" class="input-field mono-input" value="CRYPTO" placeholder="Enter keyword...">
                    <div class="preset-bar" style="margin-top: 8px;">
                        <span class="preset-chip" data-vig="CRYPTO">CRYPTO</span>
                        <span class="preset-chip" data-vig="SECURITY">SECURITY</span>
                        <span class="preset-chip" data-vig="KEY">KEY</span>
                    </div>
                `;
                break;

            case 'otp':
                html = `
                    <div class="form-label">
                        <span>One-Time Pad Key</span>
                        <span class="hint">Shannon Perfect Secrecy: Key length ≥ Text length</span>
                    </div>
                    <textarea id="otp-key-input" class="textarea-field mono-input" style="min-height: 70px;" placeholder="Click 'Generate Pad' for CSPRNG random pad..."></textarea>
                    <div style="display:flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <div style="display:flex; gap: 10px; align-items: center;">
                            <label style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="otp-mode" value="mod26" checked> Modulo 26
                            </label>
                            <label style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="otp-mode" value="xor"> Bitwise XOR
                            </label>
                        </div>
                        <button class="btn btn-purple btn-sm" id="btn-otp-gen"><i class="fa-solid fa-dice-d20"></i> Generate Random Pad</button>
                    </div>
                `;
                break;

            case 'railfence':
                html = `
                    <div class="form-label">
                        <span>Rail Depth (Rails 2 - 10)</span>
                        <span class="hint">Zig-zag vertical bounce height</span>
                    </div>
                    <div class="range-slider-group">
                        <input type="range" id="rail-slider" class="range-slider" min="2" max="10" value="3">
                        <span class="range-val-badge" id="rail-val-badge">3</span>
                    </div>
                `;
                break;

            case 'columnar':
                html = `
                    <div class="form-label">
                        <span>Transposition Keyword</span>
                        <span class="hint">Column order determined alphabetically</span>
                    </div>
                    <input type="text" id="columnar-key-input" class="input-field mono-input" value="ZEBRAS" placeholder="Enter keyword...">
                    <div id="columnar-order-badge" style="margin-top: 8px; font-size: 12px; font-family: var(--font-mono); color: var(--cyan);">
                        Order: Z(6) E(2) B(1) R(5) A(3) S(4)
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
        this.bindDynamicKeyEvents(cipherKey);
    }

    bindDynamicKeyEvents(cipherKey) {
        if (cipherKey === 'caesar') {
            const slider = document.getElementById('caesar-slider');
            const badge = document.getElementById('caesar-val-badge');
            if (slider && badge) {
                slider.addEventListener('input', (e) => {
                    badge.textContent = e.target.value;
                    this.executeEncrypt();
                });
            }
        } else if (cipherKey === 'mono') {
            const input = document.getElementById('mono-key-input');
            const btnRandom = document.getElementById('btn-mono-random');
            const btnKeyword = document.getElementById('btn-mono-keyword');
            const btnReset = document.getElementById('btn-mono-reset');

            if (input) {
                input.addEventListener('input', () => this.executeEncrypt());
            }
            if (btnRandom) {
                btnRandom.addEventListener('click', () => {
                    sound.playClick();
                    input.value = MonoalphabeticCipher.generateRandomKey();
                    this.executeEncrypt();
                });
            }
            if (btnKeyword) {
                btnKeyword.addEventListener('click', () => {
                    sound.playClick();
                    input.value = MonoalphabeticCipher.generateFromKeyword('ZEBRAS');
                    this.executeEncrypt();
                });
            }
            if (btnReset) {
                btnReset.addEventListener('click', () => {
                    sound.playClick();
                    input.value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    this.executeEncrypt();
                });
            }
        } else if (cipherKey === 'playfair') {
            const input = document.getElementById('playfair-key-input');
            if (input) {
                input.addEventListener('input', () => this.executeEncrypt());
            }
            document.querySelectorAll('[data-pf]').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    input.value = e.target.getAttribute('data-pf');
                    this.executeEncrypt();
                });
            });
        } else if (cipherKey === 'hill') {
            const selectPreset = document.getElementById('hill-presets-select');
            const btnRandom = document.getElementById('btn-hill-random');

            if (selectPreset) {
                selectPreset.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (val === 'DDCF') {
                        document.getElementById('m00').value = 3;
                        document.getElementById('m01').value = 3;
                        document.getElementById('m10').value = 2;
                        document.getElementById('m11').value = 5;
                    } else if (val === 'BACK') {
                        document.getElementById('m00').value = 1;
                        document.getElementById('m01').value = 0;
                        document.getElementById('m10').value = 2;
                        document.getElementById('m11').value = 10;
                    } else if (val === 'GYBN') {
                        document.getElementById('m00').value = 6;
                        document.getElementById('m01').value = 24;
                        document.getElementById('m10').value = 1;
                        document.getElementById('m11').value = 13;
                    }
                    this.executeEncrypt();
                });
            }

            ['m00', 'm01', 'm10', 'm11'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', () => this.executeEncrypt());
                }
            });

            if (btnRandom) {
                btnRandom.addEventListener('click', () => {
                    sound.playClick();
                    const m = MathUtils.generateRandomInvertible2x2();
                    document.getElementById('m00').value = m[0][0];
                    document.getElementById('m01').value = m[0][1];
                    document.getElementById('m10').value = m[1][0];
                    document.getElementById('m11').value = m[1][1];
                    this.executeEncrypt();
                });
            }
        } else if (cipherKey === 'vigenere') {
            const input = document.getElementById('vigenere-key-input');
            if (input) {
                input.addEventListener('input', () => this.executeEncrypt());
            }
            document.querySelectorAll('[data-vig]').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    input.value = e.target.getAttribute('data-vig');
                    this.executeEncrypt();
                });
            });
        } else if (cipherKey === 'otp') {
            const btnGen = document.getElementById('btn-otp-gen');
            const keyInput = document.getElementById('otp-key-input');
            if (btnGen && keyInput) {
                btnGen.addEventListener('click', () => {
                    sound.playClick();
                    const text = document.getElementById('input-text').value || 'NETWORK SECURITY';
                    keyInput.value = OneTimePadCipher.generateRandomPad(text.length);
                    this.executeEncrypt();
                });
            }
            if (keyInput) {
                keyInput.addEventListener('input', () => this.executeEncrypt());
            }
            document.querySelectorAll('input[name="otp-mode"]').forEach(r => {
                r.addEventListener('change', () => this.executeEncrypt());
            });
        } else if (cipherKey === 'railfence') {
            const slider = document.getElementById('rail-slider');
            const badge = document.getElementById('rail-val-badge');
            if (slider && badge) {
                slider.addEventListener('input', (e) => {
                    badge.textContent = e.target.value;
                    this.executeEncrypt();
                });
            }
        } else if (cipherKey === 'columnar') {
            const input = document.getElementById('columnar-key-input');
            const orderBadge = document.getElementById('columnar-order-badge');
            if (input) {
                input.addEventListener('input', () => {
                    try {
                        const order = ColumnarTranspositionCipher.getKeyOrder(input.value);
                        orderBadge.textContent = `Order: ` + order.cleanKey.split('').map((c, i) => `${c}(${order.colRanks[i]})`).join(' ');
                    } catch (e) {}
                    this.executeEncrypt();
                });
            }
        }
    }

    /* -------------------------------------------------------------------------
       GLOBAL ACTIONS & EVENT LISTENERS
       ------------------------------------------------------------------------- */
    bindGlobalActions() {
        const inputText = document.getElementById('input-text');
        const charCount = document.getElementById('char-count-label');
        if (inputText && charCount) {
            inputText.addEventListener('input', () => {
                charCount.textContent = `${inputText.value.length} characters`;
                this.executeEncrypt();
            });
        }

        // Preset Sample Chips
        document.querySelectorAll('.preset-chip[data-sample]').forEach(chip => {
            chip.addEventListener('click', (e) => {
                sound.playClick();
                if (inputText) {
                    inputText.value = e.target.getAttribute('data-sample');
                    charCount.textContent = `${inputText.value.length} characters`;
                    this.executeEncrypt();
                }
            });
        });

        // Encrypt & Decrypt buttons
        document.getElementById('btn-encrypt').addEventListener('click', () => {
            sound.playClick();
            this.executeEncrypt();
        });

        document.getElementById('btn-decrypt').addEventListener('click', () => {
            sound.playClick();
            this.executeDecrypt();
        });

        // Clear button
        document.getElementById('btn-clear-input').addEventListener('click', () => {
            sound.playClick();
            inputText.value = '';
            charCount.textContent = '0 characters';
            this.executeEncrypt();
        });

        // Copy buttons
        document.getElementById('btn-copy-cipher').addEventListener('click', () => {
            const text = document.getElementById('output-cipher').textContent;
            copyText(text, 'Ciphertext');
        });

        document.getElementById('btn-copy-plain').addEventListener('click', () => {
            const text = document.getElementById('output-decrypted').textContent;
            copyText(text, 'Decrypted text');
        });

        // Save Encrypted Text to File (Bonus feature)
        document.getElementById('btn-save-cipher').addEventListener('click', () => {
            const text = document.getElementById('output-cipher').textContent;
            FileHandler.downloadFile(text, `${this.activeCipher}_encrypted.txt`);
        });

        // Sound Toggle
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const enabled = sound.toggle();
                soundBtn.innerHTML = enabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
                soundBtn.classList.toggle('active', enabled);
                Toast.show(enabled ? 'Sound Effects Enabled' : 'Sound Effects Muted', 'info');
            });
        }

        // Lock button
        document.getElementById('lock-btn').addEventListener('click', () => {
            SecurityLock.lock();
        });

        // Lock screen form submit
        document.getElementById('lock-form').addEventListener('submit', () => {
            const input = document.getElementById('lock-password-input');
            SecurityLock.unlock(input.value);
        });

        document.getElementById('btn-unlock').addEventListener('click', () => {
            const input = document.getElementById('lock-password-input');
            SecurityLock.unlock(input.value);
        });

        // Quick report button & modal button
        const openReport = () => {
            sound.playClick();
            this.switchModule('help');
        };
        document.getElementById('report-modal-btn').addEventListener('click', openReport);
        document.getElementById('btn-quick-report').addEventListener('click', openReport);

        // Sample Load Button in sidebar
        document.getElementById('btn-sample-load').addEventListener('click', () => {
            this.runSampleTest();
        });

        // Visualizer Tabs
        document.querySelectorAll('.viz-tab[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                sound.playClick();
                document.querySelectorAll('.viz-tab[data-tab]').forEach(t => t.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.activeTab = target.getAttribute('data-tab');
                this.renderActiveTabContent();
            });
        });

        // Documentation Tabs
        document.querySelectorAll('.viz-tab[data-doc]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                sound.playClick();
                document.querySelectorAll('.viz-tab[data-doc]').forEach(t => t.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');
                this.renderDocumentation(target.getAttribute('data-doc'));
            });
        });

        // Print Report Button
        document.getElementById('btn-print-report').addEventListener('click', () => {
            DocumentationModule.printReport();
        });

        // Compare Algorithm Re-run button
        document.getElementById('btn-run-comparison').addEventListener('click', () => {
            sound.playClick();
            this.runAlgorithmComparison();
        });
    }

    /* -------------------------------------------------------------------------
       CIPHER EXECUTION ENGINE
       ------------------------------------------------------------------------- */
    executeEncrypt() {
        const text = document.getElementById('input-text').value;
        const cipherBox = document.getElementById('output-cipher');
        const decryptBox = document.getElementById('output-decrypted');
        const timeBadge = document.getElementById('badge-time');
        const statTime = document.getElementById('stat-time');

        if (!text) {
            cipherBox.textContent = '';
            decryptBox.textContent = '';
            cipherBox.classList.add('empty');
            decryptBox.classList.add('empty');
            timeBadge.textContent = '0.00 µs';
            statTime.textContent = '0.00 µs';
            this.renderActiveTabContent();
            return;
        }

        cipherBox.classList.remove('empty');
        decryptBox.classList.remove('empty');

        try {
            let encRes, decRes;

            switch (this.activeCipher) {
                case 'caesar': {
                    const shift = parseInt(document.getElementById('caesar-slider')?.value || 5, 10);
                    encRes = CaesarCipher.encrypt(text, shift);
                    decRes = CaesarCipher.decrypt(encRes.result, shift);
                    break;
                }
                case 'mono': {
                    const key = document.getElementById('mono-key-input')?.value || 'QWERTYUIOPASDFGHJKLZXCVBNM';
                    encRes = MonoalphabeticCipher.encrypt(text, key);
                    decRes = MonoalphabeticCipher.decrypt(encRes.result, key);
                    break;
                }
                case 'playfair': {
                    const key = document.getElementById('playfair-key-input')?.value || 'MONARCHY';
                    encRes = PlayfairCipher.encrypt(text, key);
                    decRes = PlayfairCipher.decrypt(encRes.result, key);
                    break;
                }
                case 'hill': {
                    const m00 = parseInt(document.getElementById('m00')?.value || 3, 10);
                    const m01 = parseInt(document.getElementById('m01')?.value || 3, 10);
                    const m10 = parseInt(document.getElementById('m10')?.value || 2, 10);
                    const m11 = parseInt(document.getElementById('m11')?.value || 5, 10);
                    const matrix = [[m00, m01], [m10, m11]];
                    encRes = HillCipher.encrypt(text, matrix, 2);
                    decRes = HillCipher.decrypt(encRes.result, matrix, 2);

                    const detBadge = document.getElementById('hill-det-indicator');
                    if (detBadge) {
                        if (encRes.inspect.isInvertible) {
                            detBadge.className = 'invertible-status status-valid';
                            detBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Invertible Mod 26 (det=${encRes.inspect.det}, inv=${encRes.inspect.detInverse})`;
                        } else {
                            detBadge.className = 'invertible-status status-invalid';
                            detBadge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Non-Invertible (det=${encRes.inspect.det})`;
                        }
                    }
                    break;
                }
                case 'vigenere': {
                    const key = document.getElementById('vigenere-key-input')?.value || 'CRYPTO';
                    encRes = VigenereCipher.encrypt(text, key);
                    decRes = VigenereCipher.decrypt(encRes.result, key);
                    break;
                }
                case 'otp': {
                    let key = document.getElementById('otp-key-input')?.value;
                    if (!key) {
                        key = OneTimePadCipher.generateRandomPad(text.length);
                        document.getElementById('otp-key-input').value = key;
                    }
                    const mode = document.querySelector('input[name="otp-mode"]:checked')?.value || 'mod26';
                    if (mode === 'xor') {
                        const xorRes = OneTimePadCipher.processXor(text, key);
                        encRes = { result: xorRes.hexResult, timeMs: xorRes.timeMs, steps: xorRes.steps };
                        decRes = { result: xorRes.charResult };
                    } else {
                        encRes = OneTimePadCipher.encryptMod26(text, key);
                        decRes = OneTimePadCipher.decryptMod26(encRes.result, key);
                    }
                    break;
                }
                case 'railfence': {
                    const rails = parseInt(document.getElementById('rail-slider')?.value || 3, 10);
                    encRes = RailFenceCipher.encrypt(text, rails);
                    decRes = RailFenceCipher.decrypt(encRes.result, rails);
                    break;
                }
                case 'columnar': {
                    const key = document.getElementById('columnar-key-input')?.value || 'ZEBRAS';
                    encRes = ColumnarTranspositionCipher.encrypt(text, key);
                    decRes = ColumnarTranspositionCipher.decrypt(encRes.result, key, encRes.padCount);
                    break;
                }
            }

            this.lastEncryptResult = encRes;
            this.lastDecryptResult = decRes;

            cipherBox.textContent = encRes.result;
            decryptBox.textContent = decRes.result;
            const timeStr = formatExecutionTime(encRes.timeMs);
            timeBadge.textContent = timeStr;
            statTime.textContent = timeStr;

            this.renderActiveTabContent();
        } catch (error) {
            cipherBox.textContent = `Error: ${error.message}`;
            decryptBox.textContent = 'Decryption aborted.';
            console.warn('Cipher error:', error);
        }
    }

    executeDecrypt() {
        // User wants to decrypt whatever is in the input box
        const text = document.getElementById('input-text').value;
        const decryptBox = document.getElementById('output-decrypted');
        if (!text) return;

        try {
            let decRes;
            switch (this.activeCipher) {
                case 'caesar': {
                    const shift = parseInt(document.getElementById('caesar-slider')?.value || 5, 10);
                    decRes = CaesarCipher.decrypt(text, shift);
                    break;
                }
                case 'mono': {
                    const key = document.getElementById('mono-key-input')?.value || 'QWERTYUIOPASDFGHJKLZXCVBNM';
                    decRes = MonoalphabeticCipher.decrypt(text, key);
                    break;
                }
                case 'playfair': {
                    const key = document.getElementById('playfair-key-input')?.value || 'MONARCHY';
                    decRes = PlayfairCipher.decrypt(text, key);
                    break;
                }
                case 'hill': {
                    const m00 = parseInt(document.getElementById('m00')?.value || 3, 10);
                    const m01 = parseInt(document.getElementById('m01')?.value || 3, 10);
                    const m10 = parseInt(document.getElementById('m10')?.value || 2, 10);
                    const m11 = parseInt(document.getElementById('m11')?.value || 5, 10);
                    const matrix = [[m00, m01], [m10, m11]];
                    decRes = HillCipher.decrypt(text, matrix, 2);
                    break;
                }
                case 'vigenere': {
                    const key = document.getElementById('vigenere-key-input')?.value || 'CRYPTO';
                    decRes = VigenereCipher.decrypt(text, key);
                    break;
                }
                case 'otp': {
                    const key = document.getElementById('otp-key-input')?.value;
                    decRes = OneTimePadCipher.decryptMod26(text, key);
                    break;
                }
                case 'railfence': {
                    const rails = parseInt(document.getElementById('rail-slider')?.value || 3, 10);
                    decRes = RailFenceCipher.decrypt(text, rails);
                    break;
                }
                case 'columnar': {
                    const key = document.getElementById('columnar-key-input')?.value || 'ZEBRAS';
                    decRes = ColumnarTranspositionCipher.decrypt(text, key);
                    break;
                }
            }
            decryptBox.textContent = decRes.result;
            Toast.show('Decryption complete', 'success');
        } catch (e) {
            Toast.show(`Decryption error: ${e.message}`, 'error');
        }
    }

    /* -------------------------------------------------------------------------
       VISUALIZATION & TAB RENDERING
       ------------------------------------------------------------------------- */
    renderActiveTabContent() {
        const container = document.getElementById('viz-content-container');
        if (!container) return;

        if (this.activeTab === 'frequency') {
            this.renderFrequencyTab(container);
        } else if (this.activeTab === 'steps') {
            this.renderStepsTab(container);
        } else {
            this.renderVisualizerTab(container);
        }
    }

    renderVisualizerTab(container) {
        if (!this.lastEncryptResult) {
            container.innerHTML = '<div style="color:var(--text-dark); padding:16px;">No cipher data to visualize.</div>';
            return;
        }

        switch (this.activeCipher) {
            case 'caesar': {
                const shift = this.lastEncryptResult.shift || 5;
                const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let plainRow = '', cipherRow = '';
                for (let i = 0; i < 26; i++) {
                    const shiftedChar = alpha[(i + shift) % 26];
                    plainRow += `<div class="alpha-cell">${alpha[i]}</div>`;
                    cipherRow += `<div class="alpha-cell shift-active">${shiftedChar}</div>`;
                }

                container.innerHTML = `
                    <div class="caesar-ribbon">
                        <div style="font-size: 12px; color: var(--cyan); margin-bottom: 6px;">
                            <i class="fa-solid fa-arrows-left-right"></i> Caesar Shift Wheel Alignment (k = ${shift})
                        </div>
                        <div class="alphabet-row"><span class="alpha-label">Plain:</span>${plainRow}</div>
                        <div class="alphabet-row"><span class="alpha-label">Shift:</span>${cipherRow}</div>
                    </div>
                `;
                break;
            }

            case 'mono': {
                const map = this.lastEncryptResult.map || {};
                let chips = '';
                for (const p in map) {
                    chips += `
                        <div class="mono-chip">
                            <span class="plain">${p}</span>
                            <span class="arrow">↓</span>
                            <span class="cipher">${map[p]}</span>
                        </div>
                    `;
                }
                container.innerHTML = `
                    <div style="margin-bottom: 8px; font-size: 12px; color: var(--cyan);">
                        <i class="fa-solid fa-shuffle"></i> 1-to-1 Substitution Mapping Table
                    </div>
                    <div class="mono-map-grid">${chips}</div>
                `;
                break;
            }

            case 'playfair': {
                const matrix = this.lastEncryptResult.matrix || [];
                const steps = this.lastEncryptResult.steps || [];
                let gridHtml = '';
                matrix.forEach(row => {
                    row.forEach(cell => {
                        gridHtml += `<div class="playfair-cell">${cell}</div>`;
                    });
                });

                let digraphsHtml = '';
                steps.slice(0, 12).forEach(s => {
                    digraphsHtml += `
                        <div class="digraph-tag">
                            <span><b>${s.inPair}</b> → <b style="color:var(--emerald);">${s.outPair}</b></span>
                            <span class="rule-badge">${s.rule}</span>
                        </div>
                    `;
                });

                container.innerHTML = `
                    <div class="playfair-container">
                        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                            <span style="font-size:12px; color:var(--cyan);"><i class="fa-solid fa-table-cells"></i> 5×5 Key Matrix</span>
                            <span style="font-size:11px; color:var(--text-muted);">(I and J share a single slot)</span>
                        </div>
                        <div class="playfair-grid">${gridHtml}</div>
                        <div style="width:100%;">
                            <div style="font-size:12px; color:var(--text-muted); margin-bottom:6px;">Digraph Transformations:</div>
                            <div class="playfair-digraphs">${digraphsHtml}</div>
                        </div>
                    </div>
                `;
                break;
            }

            case 'hill': {
                const inspect = this.lastEncryptResult.inspect;
                if (!inspect) return;
                const m = inspect.inverseMatrix;

                container.innerHTML = `
                    <div class="hill-math-card">
                        <div style="color:var(--cyan); font-weight:700;"><i class="fa-solid fa-square-root-variable"></i> Hill Linear Algebra Parameters:</div>
                        <div>• Determinant: <b>${inspect.detRaw}</b> ≡ <b>${inspect.det}</b> (mod 26)</div>
                        <div>• Coprime Check: gcd(${inspect.det}, 26) = <b>${inspect.gcd}</b> ${inspect.isInvertible ? '(Valid Key)' : '(INVALID - Non-Invertible)'}</div>
                        <div>• Modular Inverse of det: <b>det⁻¹ ≡ ${inspect.detInverse}</b> (mod 26)</div>
                        ${m ? `
                        <div>• Decryption Matrix K⁻¹ (mod 26):</div>
                        <div class="matrix-bracket-wrap">
                            <div class="matrix-grid-2x2">
                                <div class="matrix-cell-input" style="display:flex;align-items:center;justify-content:center;">${m[0][0]}</div>
                                <div class="matrix-cell-input" style="display:flex;align-items:center;justify-content:center;">${m[0][1]}</div>
                                <div class="matrix-cell-input" style="display:flex;align-items:center;justify-content:center;">${m[1][0]}</div>
                                <div class="matrix-cell-input" style="display:flex;align-items:center;justify-content:center;">${m[1][1]}</div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
                break;
            }

            case 'vigenere': {
                const steps = this.lastEncryptResult.steps || [];
                let rowP = '', rowK = '', rowC = '';
                steps.slice(0, 24).forEach(s => {
                    rowP += `<span class="stream-cell">${s.plainChar}</span>`;
                    rowK += `<span class="stream-cell" style="color:var(--purple);">${s.keyChar}</span>`;
                    rowC += `<span class="stream-cell" style="color:var(--cyan); font-weight:700;">${s.resultChar}</span>`;
                });

                container.innerHTML = `
                    <div class="vigenere-stream">
                        <div style="color:var(--cyan); font-size:12px; margin-bottom:4px;"><i class="fa-solid fa-bars-staggered"></i> Repeated Keystream Alignment:</div>
                        <div class="stream-row"><span class="row-label">Plain:</span>${rowP}</div>
                        <div class="stream-row"><span class="row-label">Key:</span>${rowK}</div>
                        <div class="stream-row"><span class="row-label">Cipher:</span>${rowC}</div>
                    </div>
                `;
                break;
            }

            case 'otp': {
                const steps = this.lastEncryptResult.steps || [];
                let listHtml = '';
                steps.slice(0, 10).forEach(s => {
                    if (s.hex !== undefined) {
                        listHtml += `<div style="font-family:var(--font-mono); font-size:12px; margin-bottom:4px;">Char '${s.plainChar}' (${s.pBin}) ⊕ Key '${s.keyChar}' (${s.kBin}) = <b>${s.cBin}</b> [Hex 0x${s.hex}]</div>`;
                    } else {
                        listHtml += `<div style="font-family:var(--font-mono); font-size:12px; margin-bottom:4px;">'${s.plainChar}' (${s.pVal}) + '${s.keyChar}' (${s.kVal}) mod 26 = <b>'${s.resultChar}' (${s.cVal})</b></div>`;
                    }
                });
                container.innerHTML = `
                    <div style="background:rgba(0,0,0,0.35); padding:16px; border-radius:12px; border:1px solid var(--border-subtle);">
                        <div style="color:var(--purple); font-size:12px; font-weight:700; margin-bottom:8px;"><i class="fa-solid fa-key"></i> One-Time Pad Character Combinations:</div>
                        ${listHtml}
                    </div>
                `;
                break;
            }

            case 'railfence': {
                const grid = this.lastEncryptResult.grid || [];
                const numRails = this.lastEncryptResult.numRails || 3;
                let tableHtml = '';

                grid.forEach((row, r) => {
                    let cells = '';
                    row.slice(0, 30).forEach(c => {
                        if (c !== null) {
                            cells += `<td class="rail-cell"><span class="rail-char">${c}</span></td>`;
                        } else {
                            cells += `<td class="rail-cell"><span class="rail-dot">•</span></td>`;
                        }
                    });
                    tableHtml += `<tr><td class="rail-header">Rail ${r + 1}</td>${cells}</tr>`;
                });

                container.innerHTML = `
                    <div class="rail-grid-container">
                        <div style="color:var(--cyan); font-size:12px; margin-bottom:8px;"><i class="fa-solid fa-wave-square"></i> Rail Fence 2D Zig-Zag Trajectory (${numRails} Rails):</div>
                        <table class="rail-table">${tableHtml}</table>
                    </div>
                `;
                break;
            }

            case 'columnar': {
                const grid = this.lastEncryptResult.grid || [];
                const cleanKey = this.lastEncryptResult.cleanKey || '';
                const colRanks = this.lastEncryptResult.colRanks || [];

                let headerHtml = '<tr>', rankHtml = '<tr>';
                cleanKey.split('').forEach((k, idx) => {
                    headerHtml += `<th class="col-key-cell">${k}</th>`;
                    rankHtml += `<th class="col-rank-cell">Col ${colRanks[idx]}</th>`;
                });
                headerHtml += '</tr>';
                rankHtml += '</tr>';

                let rowsHtml = '';
                grid.slice(0, 10).forEach(row => {
                    rowsHtml += '<tr>';
                    row.forEach(cell => {
                        rowsHtml += `<td class="col-data-cell">${cell}</td>`;
                    });
                    rowsHtml += '</tr>';
                });

                container.innerHTML = `
                    <div class="columnar-grid-wrap">
                        <div style="color:var(--cyan); font-size:12px; margin-bottom:8px;"><i class="fa-solid fa-table-columns"></i> Transposition Permutation Matrix:</div>
                        <table class="col-table">
                            <thead>${headerHtml}${rankHtml}</thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </div>
                `;
                break;
            }
        }
    }

    renderStepsTab(container) {
        const steps = this.lastEncryptResult?.steps || [];
        if (steps.length === 0) {
            container.innerHTML = '<div style="color:var(--text-dark); padding:16px;">No mathematical steps recorded for this cipher.</div>';
            return;
        }

        let stepsHtml = '';
        steps.slice(0, 20).forEach((s, idx) => {
            const formula = s.formula || `${s.plainChar || s.original} → ${s.resultChar || s.mapped}`;
            stepsHtml += `
                <div style="display:flex; justify-content:space-between; padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.04); font-family:var(--font-mono); font-size:12px;">
                    <span style="color:var(--text-dark);">Step ${idx + 1}</span>
                    <span style="color:var(--text-muted);">${formula}</span>
                    <span style="color:var(--cyan); font-weight:700;">${s.resultChar || s.outPair || s.cipherChars || ''}</span>
                </div>
            `;
        });

        container.innerHTML = `
            <div style="background:rgba(0,0,0,0.35); border-radius:12px; padding:12px; max-height:260px; overflow-y:auto;">
                ${stepsHtml}
            </div>
        `;
    }

    renderFrequencyTab(container) {
        const text = document.getElementById('output-cipher')?.textContent || '';
        const analysis = FrequencyAnalysis.analyze(text);

        let barsHtml = '';
        analysis.frequencies.forEach(f => {
            const barHeight = Math.min(100, f.percentage * 5);
            const engHeight = Math.min(100, f.englishPct * 5);
            barsHtml += `
                <div class="freq-bar-group" title="${f.letter}: ${f.count} (${f.percentage.toFixed(1)}%) vs English (${f.englishPct.toFixed(1)}%)">
                    <div class="freq-bar" style="height: ${barHeight}%;"></div>
                    <div class="freq-bar english-ref" style="height: ${engHeight}%;"></div>
                    <span class="freq-label">${f.letter}</span>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="freq-chart-container">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:12px; color:var(--cyan); font-weight:700;"><i class="fa-solid fa-chart-simple"></i> Letter Distribution vs Standard English</span>
                    <span style="font-size:11px; font-family:var(--font-mono); color:var(--emerald);">Index of Coincidence (IoC): <b>${analysis.ioc}</b></span>
                </div>
                <div class="freq-bars">${barsHtml}</div>
                <div style="font-size:12px; color:var(--text-muted); background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:8px;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--purple);"></i> <b>Cryptanalysis Diagnosis:</b> ${analysis.diagnosis}
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------------------
       MODULE 9: BENCHMARK & COMPARISON TABLE
       ------------------------------------------------------------------------- */
    runAlgorithmComparison() {
        const text = document.getElementById('input-text')?.value || 'NETWORK SECURITY';
        const results = AlgorithmComparison.compareAll(text);
        const tbody = document.getElementById('comparison-tbody');
        if (!tbody) return;

        let rowsHtml = '';
        results.forEach(r => {
            let secClass = 'sec-broken';
            if (r.security.includes('PERFECT')) secClass = 'sec-perfect';
            else if (r.security.includes('Moderate')) secClass = 'sec-moderate';

            rowsHtml += `
                <tr>
                    <td style="font-weight:600; color:#fff;">${r.name}</td>
                    <td style="color:var(--text-muted);">${r.category}</td>
                    <td style="font-family:var(--font-mono); font-size:11px; color:var(--cyan);">${r.key}</td>
                    <td style="font-family:var(--font-mono); color:var(--emerald); font-weight:600;">${formatExecutionTime(r.timeMs)}</td>
                    <td><span class="security-badge ${secClass}">${r.security}</span></td>
                    <td style="font-size:12px; color:var(--text-muted);">${r.attack}</td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml;
        Toast.show('Benchmark comparison completed for all 8 ciphers', 'success');
    }

    /* -------------------------------------------------------------------------
       MODULES 10 & 11: FILE ENCRYPTION & DECRYPTION
       ------------------------------------------------------------------------- */
    bindFileEvents() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const fileInfo = document.getElementById('file-info-badge');
        const nameLabel = document.getElementById('file-name-label');
        const sizeLabel = document.getElementById('file-size-label');

        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--cyan)';
                dropZone.style.background = 'rgba(6, 182, 212, 0.1)';
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                dropZone.style.background = 'rgba(0,0,0,0.3)';
            });

            dropZone.addEventListener('drop', async (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                dropZone.style.background = 'rgba(0,0,0,0.3)';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    await this.loadSelectedFile(files[0]);
                }
            });

            fileInput.addEventListener('change', async (e) => {
                if (e.target.files.length > 0) {
                    await this.loadSelectedFile(e.target.files[0]);
                }
            });
        }

        // Encrypt File Button
        document.getElementById('btn-file-encrypt').addEventListener('click', () => {
            sound.playClick();
            this.processFileAction(true);
        });

        // Decrypt File Button
        document.getElementById('btn-file-decrypt').addEventListener('click', () => {
            sound.playClick();
            this.processFileAction(false);
        });

        // Download File Result Button
        document.getElementById('btn-download-file-result').addEventListener('click', () => {
            const preview = document.getElementById('file-preview-output').value;
            FileHandler.downloadFile(preview, 'processed_cryptography_output.txt');
        });
    }

    async loadSelectedFile(file) {
        try {
            const data = await FileHandler.readFile(file);
            document.getElementById('file-info-badge').style.display = 'flex';
            document.getElementById('file-name-label').textContent = data.name;
            document.getElementById('file-size-label').textContent = `${(data.size / 1024).toFixed(1)} KB (${data.charCount} chars)`;
            document.getElementById('file-preview-output').value = data.content.slice(0, 5000);
            Toast.show(`Loaded file: ${data.name}`, 'success');
        } catch (e) {
            Toast.show(`Error loading file: ${e.message}`, 'error');
        }
    }

    processFileAction(isEncrypt) {
        const content = FileHandler.fileContent;
        if (!content) {
            Toast.show('Please upload a text file first', 'warning');
            return;
        }

        const cipherType = document.getElementById('file-cipher-select').value;
        const preview = document.getElementById('file-preview-output');

        try {
            let output = '';
            if (cipherType === 'caesar') {
                output = isEncrypt ? CaesarCipher.encrypt(content, 5).result : CaesarCipher.decrypt(content, 5).result;
            } else if (cipherType === 'vigenere') {
                output = isEncrypt ? VigenereCipher.encrypt(content, 'SECURITY').result : VigenereCipher.decrypt(content, 'SECURITY').result;
            } else if (cipherType === 'railfence') {
                output = isEncrypt ? RailFenceCipher.encrypt(content, 3).result : RailFenceCipher.decrypt(content, 3).result;
            } else if (cipherType === 'columnar') {
                output = isEncrypt ? ColumnarTranspositionCipher.encrypt(content, 'KEYWORD').result : ColumnarTranspositionCipher.decrypt(content, 'KEYWORD').result;
            } else {
                output = isEncrypt ? CaesarCipher.encrypt(content, 3).result : CaesarCipher.decrypt(content, 3).result;
            }

            preview.value = output;
            Toast.show(`File successfully ${isEncrypt ? 'encrypted' : 'decrypted'}!`, 'success');
        } catch (e) {
            Toast.show(`Processing error: ${e.message}`, 'error');
        }
    }

    /* -------------------------------------------------------------------------
       MODULE 12: DOCUMENTATION, ACADEMY & PROJECT REPORT
       ------------------------------------------------------------------------- */
    renderDocumentation(docType) {
        const container = document.getElementById('doc-container');
        if (!container) return;

        if (docType === 'report') {
            container.innerHTML = `
                <div class="print-only-header" style="display:none;">
                    <h1>CLASSICAL CRYPTOGRAPHY TOOLKIT - PROJECT REPORT</h1>
                    <p>Course: Network Security | Class: Final Year(ECM)_2026-27</p>
                </div>

                <div style="font-family: var(--font-body); color: var(--text-main); line-height: 1.8;">
                    <div style="border-bottom: 2px solid var(--border-subtle); padding-bottom: 16px; margin-bottom: 24px;">
                        <span style="font-size: 11px; color: var(--cyan); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Department of Electronics & Computer Engineering</span>
                        <h2 style="font-family: var(--font-heading); font-size: 26px; color: #fff; margin-top: 4px;">Design and Development of a Classical Cryptography Toolkit</h2>
                        <div style="display: flex; gap: 24px; margin-top: 12px; font-size: 13px; color: var(--text-muted); flex-wrap: wrap;">
                            <div><b>Course:</b> Network Security</div>
                            <div><b>Class:</b> Final Year(ECM)_2026-27</div>
                            <div><b>Date:</b> October 2026</div>
                            <div><b>Type:</b> Interactive Menu-Driven Web Application</div>
                        </div>
                    </div>

                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin: 20px 0 10px;">1. Objectives</h3>
                    <p>To design and develop an interactive menu-driven software application that implements classical encryption algorithms for secure text encryption and decryption, offering step-by-step mathematical visualization, cryptanalysis capabilities, and performance benchmarking.</p>

                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin: 20px 0 10px;">2. Problem Statement</h3>
                    <p>Develop a menu-driven Cryptography Toolkit that allows users to encrypt and decrypt text using different classical encryption algorithms. The application provides an interactive interface where the user selects the desired cipher, enters plaintext and keys, and views corresponding ciphertext and decrypted text along with execution timing.</p>

                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin: 20px 0 10px;">3. Implemented Modules</h3>
                    <ul style="margin-left: 20px; color: var(--text-muted);">
                        <li><b>Substitution Ciphers:</b> Caesar Cipher, Monoalphabetic Substitution, Playfair (5×5 Digraphic), Hill Cipher (2×2 / 3×3 Invertible Matrix), Vigenère Polyalphabetic, One-Time Pad (Vernam CSPRNG).</li>
                        <li><b>Transposition Ciphers:</b> Rail Fence (Zig-Zag Trajectory), Columnar Transposition (Permutation Matrix).</li>
                        <li><b>Utility Modules:</b> Algorithm Comparison Benchmark, Text File Encryption & Decryption (Drag & Drop), Documentation & Manual, Security Lock & Password Protection.</li>
                    </ul>

                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin: 20px 0 10px;">4. Sample Test Verification (As per Specification)</h3>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 16px; font-family: var(--font-mono); font-size: 13px; color: var(--emerald);">
                        <div>Plaintext Input: &nbsp;<b>NETWORK SECURITY</b></div>
                        <div>Selected Cipher: &nbsp;<b>Caesar Cipher</b></div>
                        <div>Key (Shift): &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>5</b></div>
                        <div>Encrypted Text: &nbsp;&nbsp;<b>SJYBTWP XJHZWNYD</b></div>
                        <div>Decrypted Text: &nbsp;&nbsp;<b>NETWORK SECURITY</b> &nbsp;<i class="fa-solid fa-check"></i> Verified Accurate</div>
                    </div>

                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin: 20px 0 10px;">5. System Architecture & Flowchart</h3>
                    <p style="color:var(--text-muted);">The toolkit employs an Event-Driven Modular Frontend Architecture running on modern browser standards (HTML5, ES6 Modules, and Vanilla CSS Design System). Every cipher operation executes client-side without server lag, delivering sub-millisecond execution times and complete data confidentiality.</p>

                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin: 20px 0 10px;">6. Applications & Educational Relevance</h3>
                    <p style="color:var(--text-muted);">Classical ciphers form the conceptual bedrock of modern cryptography (AES, RSA, ECC). Studying substitution and transposition illuminates Shannon's principles of Confusion and Diffusion, key schedule design, and cryptanalytic principles such as frequency analysis and linear cryptanalysis.</p>
                </div>
            `;
        } else if (docType === 'academy') {
            container.innerHTML = `
                <div style="line-height: 1.8;">
                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin-bottom: 12px;">Cryptography Academy & Theory Encyclopedia</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        ${['caesar', 'mono', 'playfair', 'hill', 'vigenere', 'otp', 'railfence', 'columnar'].map(cId => {
                            const t = DocumentationModule.getCipherTheory(cId);
                            return `
                                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px;">
                                    <h4 style="color:#fff; font-size:15px; margin-bottom:4px;">${t.title}</h4>
                                    <div style="font-size:11px; color:var(--cyan); margin-bottom:8px;">${t.category}</div>
                                    <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:8px;">${t.history}</p>
                                    <div style="background:rgba(0,0,0,0.4); padding:8px; border-radius:6px; font-family:var(--font-mono); font-size:11px; color:var(--text-accent); white-space:pre-line;">${t.formula}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="line-height: 1.8;">
                    <h3 style="color: var(--cyan); font-family: var(--font-heading); margin-bottom: 12px;">Toolkit User Manual</h3>
                    <ol style="margin-left: 20px; color: var(--text-muted);">
                        <li><b>Select Cipher:</b> Use the left navigation sidebar to pick any cipher from 1 to 8, or select utilities 9 through 13.</li>
                        <li><b>Enter Text:</b> Type or paste plaintext into the input area. You can also click the quick sample buttons like "NETWORK SECURITY".</li>
                        <li><b>Configure Key:</b> Adjust key controls (Caesar slider, Monoalphabetic shuffle, Hill 2×2 matrix, etc.). Real-time validation badges highlight key invertibility.</li>
                        <li><b>View Transformations:</b> The right pane renders encrypted ciphertext and verified decrypted plaintext, accompanied by precision microsecond timing.</li>
                        <li><b>Inspect Visualizer:</b> Click the "Visualizer", "Step Breakdown", or "Frequency Analysis" tabs to inspect intermediate mathematical steps.</li>
                        <li><b>Lock Toolkit:</b> Click Lock Toolkit or select Module 13 to lock the interface behind the master passcode (<code style="color:var(--cyan);">admin</code>).</li>
                    </ol>
                </div>
            `;
        }
    }

    /* -------------------------------------------------------------------------
       DEFAULT SAMPLE TEST (MATCHING DOCX SPECIFICATION)
       ------------------------------------------------------------------------- */
    runSampleTest() {
        this.switchModule('caesar');
        const input = document.getElementById('input-text');
        const slider = document.getElementById('caesar-slider');
        const badge = document.getElementById('caesar-val-badge');
        if (input) input.value = 'NETWORK SECURITY';
        if (slider) slider.value = 5;
        if (badge) badge.textContent = '5';
        this.executeEncrypt();
        Toast.show('Loaded official test sample: "NETWORK SECURITY" (Caesar k=5)', 'info');
    }
}

// Bootstrap application once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CryptographyApp();
});
