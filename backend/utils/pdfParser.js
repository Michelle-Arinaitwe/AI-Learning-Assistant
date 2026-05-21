import fs from 'fs/promises';

// pdf-parse has an ESM-unfriendly test-file loader at the package root,
// so we import from the library entry directly to avoid it.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const extractTextFromPDF = async (filePath) => {
    try {
        console.log(`[PDF Parser] Starting to parse: ${filePath}`);

        const dataBuffer = await fs.readFile(filePath);
        console.log(`[PDF Parser] File read. Buffer size: ${dataBuffer.length} bytes`);

        const data = await pdfParse(dataBuffer);
        console.log(`[PDF Parser] Parsed. Pages: ${data.numpages}, Text length: ${data.text.length}`);

        return {
            text: data.text || 'No text could be extracted from PDF',
            numPages: data.numpages,
            info: data.info || {}
        };
    } catch (error) {
        console.error('❌ [PDF Parser] Error:', error.message);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};
