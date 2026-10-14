/**
 * Modules 10 & 11: Text File Encryption & Decryption Module
 * Bonus Features: File upload, save encrypted text to file, load plaintext from file
 */
import { Toast, sound } from '../utils/ui-helpers.js';

export const FileHandler = {
    currentFile: null,
    fileContent: '',

    /**
     * Read text file asynchronously
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file provided'));
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentFile = file;
                this.fileContent = e.target.result;
                resolve({
                    name: file.name,
                    size: file.size,
                    type: file.type || 'text/plain',
                    content: this.fileContent,
                    charCount: this.fileContent.length
                });
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    /**
     * Download text content as a file
     */
    downloadFile(content, filename = 'crypto_output.txt') {
        if (!content) {
            Toast.show('No content to download', 'warning');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        sound.playSuccess();
        Toast.show(`Downloaded ${filename}`, 'success');
    }
};
