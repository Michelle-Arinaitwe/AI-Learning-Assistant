import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text content from a PDF file using pdf-parse v2.
 * @param {string} filePath - Absolute path to the PDF on disk
 * @returns {Promise<{ text: string, numPages: number, info: object }>}
 */
export const extractTextFromPDF = async (filePath) => {
    let parser;
    try {
        console.log(`[PDF Parser] Reading: ${filePath}`);
        const dataBuffer = await fs.readFile(filePath);
        console.log(`[PDF Parser] Buffer size: ${dataBuffer.length} bytes`);

        // pdf-parse v2: new PDFParse({ data: Buffer }) → .load() → .getText()
        parser = new PDFParse({ data: dataBuffer });
        await parser.load();

        const [textResult, infoResult] = await Promise.all([
            parser.getText(),
            parser.getInfo()
        ]);

        const fullText = textResult.text || '';
        const numPages = infoResult.total || 0;

        console.log(`[PDF Parser] ✅ Done — ${numPages} pages, ${fullText.length} chars`);

        return {
            text: fullText.trim() || 'No text could be extracted from this PDF',
            numPages,
            info: infoResult.info || {}
        };
    } catch (error) {
        console.error('❌ [PDF Parser] Error:', error.message);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    } finally {
        if (parser) await parser.destroy().catch(() => {});
    }
};
