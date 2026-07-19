const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extracts text from a PDF for use in full-text search indexing.
 * Returns an empty string on failure rather than throwing, since
 * search indexing is a nice-to-have, not a blocker for upload.
 */
async function extractPdfText(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (err) {
    console.warn('PDF text extraction failed:', err.message);
    return '';
  }
}

module.exports = extractPdfText;
