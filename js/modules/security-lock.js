/**
 * Module 13 & Security Feature: Password Protection & Toolkit Lock Screen
 * Classical Cryptography Toolkit
 */
import { Toast, sound } from '../utils/ui-helpers.js';

export const SecurityLock = {
    isLocked: false,
    masterPassword: 'admin',
    isProtectionEnabled: false,

    init() {
        // Load stored preference if available
        try {
            const savedPass = localStorage.getItem('crypto_toolkit_pass');
            if (savedPass) this.masterPassword = savedPass;
            const enabled = localStorage.getItem('crypto_toolkit_protect');
            if (enabled === 'true') {
                this.isProtectionEnabled = true;
                this.lock();
            }
        } catch (e) {}
    },

    lock() {
        this.isLocked = true;
        const overlay = document.getElementById('lock-screen-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            const passInput = document.getElementById('lock-password-input');
            if (passInput) {
                passInput.value = '';
                passInput.focus();
            }
        }
    },

    unlock(enteredPassword) {
        if (!enteredPassword) {
            Toast.show('Please enter password', 'warning');
            return false;
        }

        if (enteredPassword === this.masterPassword) {
            this.isLocked = false;
            const overlay = document.getElementById('lock-screen-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
            sound.playSuccess();
            Toast.show('Toolkit Unlocked Successfully', 'success');
            return true;
        } else {
            sound.playError();
            Toast.show('Invalid Password! Default password is "admin"', 'error');
            return false;
        }
    },

    setPassword(newPass) {
        if (!newPass || newPass.length < 3) {
            Toast.show('Password must be at least 3 characters', 'warning');
            return false;
        }
        this.masterPassword = newPass;
        try {
            localStorage.setItem('crypto_toolkit_pass', newPass);
        } catch (e) {}
        Toast.show('Master Password updated successfully!', 'success');
        return true;
    },

    toggleProtection(enable) {
        this.isProtectionEnabled = enable;
        try {
            localStorage.setItem('crypto_toolkit_protect', enable ? 'true' : 'false');
        } catch (e) {}
        if (enable) {
            Toast.show('Password protection enabled. Toolkit will lock on exit or reload.', 'info');
        } else {
            Toast.show('Password protection disabled.', 'info');
        }
    }
};
