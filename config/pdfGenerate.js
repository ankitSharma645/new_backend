import ejs from 'ejs';
import puppeteer from 'puppeteer';

export class PDFGenerate {
    constructor() {}

    async renderEjs(filePath, data) {
        try {
            const content = await ejs.renderFile(filePath, data);
            return content;
        } catch (error) {
            throw new Error(`Error rendering EJS file: ${error.message}`);
        }
    }

    async convertHtmlToPdf(htmlContent, outputPath, format) {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(htmlContent);
            const options = { path: outputPath, printBackground: true,  format };
            await page.pdf(options);
        } catch (error) {
            throw new Error(`Error generating PDF: ${error.message}`);
        } finally {
            await browser.close();
        }
    }
}
