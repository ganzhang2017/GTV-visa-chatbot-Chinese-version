// api/guide_content.js - Quick fix version
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache configuration
let cachedContent = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Dynamic PDF parser loading
let pdfParse = null;

async function initPdfParse() {
    if (pdfParse) return pdfParse;
    
    try {
        // Try the most common import pattern first
        const module = await import('pdf-parse');
        pdfParse = module.default || module;
        return pdfParse;
    } catch (error) {
        console.warn('Could not load pdf-parse:', error.message);
        return null;
    }
}

// Main function to get PDF content
export async function getNotionPageContent() {
    try {
        // Check if we have cached content that's still fresh
        if (cachedContent && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            console.log("✅ Using cached PDF content");
            return cachedContent;
        }

        console.log("🔍 Looking for PDF guide file...");
        
        // Try to find the PDF file in multiple possible locations
        const possiblePaths = [
            // Most common locations in Vercel deployment
            path.join(process.cwd(), 'assets', 'guide.pdf'),
            path.join(process.cwd(), 'public', 'assets', 'guide.pdf'),
            path.join(process.cwd(), 'public', 'guide.pdf'),
            
            // Alternative locations
            path.join(__dirname, '..', 'assets', 'guide.pdf'),
            path.join(__dirname, '..', '..', 'assets', 'guide.pdf'),
            path.join(__dirname, '..', '..', 'public', 'assets', 'guide.pdf'),
            path.join(__dirname, '..', '..', 'public', 'guide.pdf'),
            
            // Root level locations
            path.join(process.cwd(), 'guide.pdf'),
            './assets/guide.pdf',
            './public/assets/guide.pdf',
            './guide.pdf'
        ];

        let filePath = null;
        let foundPath = null;
        
        for (const possiblePath of possiblePaths) {
            try {
                if (fs.existsSync(possiblePath)) {
                    const stats = fs.statSync(possiblePath);
                    if (stats.isFile() && stats.size > 1000) { // Minimum file size check
                        filePath = possiblePath;
                        foundPath = possiblePath;
                        console.log(`✅ Found PDF at: ${filePath} (${stats.size} bytes)`);
                        break;
                    }
                }
            } catch (error) {
                // Skip this path and try next
                continue;
            }
        }

        if (!filePath) {
            console.error('❌ PDF guide file not found in any expected location');
            console.log("🔄 Using comprehensive fallback content");
            return getFallbackContent();
        }

        console.log(`📖 Reading and parsing PDF from: ${foundPath}`);
        
        // Read the PDF file
        const dataBuffer = fs.readFileSync(filePath);
        console.log(`📄 PDF file size: ${dataBuffer.length} bytes`);
        
        if (dataBuffer.length < 1000) {
            throw new Error("PDF file appears to be too small or corrupted");
        }

        // Try to initialize PDF parser
        const pdfParseFunc = await initPdfParse();
        if (!pdfParseFunc) {
            console.warn('⚠️ PDF parsing not available, using fallback content');
            return getFallbackContent();
        }

        const pdfOptions = {
            normalizeWhitespace: false,
            disableCombineTextItems: false
        };

        const data = await pdfParseFunc(dataBuffer, pdfOptions);

        if (!data.text || data.text.trim().length < 100) {
            throw new Error(`Could not extract sufficient text from PDF. Extracted ${data.text ? data.text.length : 0} characters`);
        }

        // Clean up the extracted text
        let cleanedText = data.text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        // Cache the content
        cachedContent = cleanedText;
        cacheTimestamp = Date.now();

        console.log(`✅ Successfully loaded PDF content: ${cleanedText.length} characters, ${data.numpages} pages`);
        
        return cleanedText;

    } catch (error) {
        console.error('❌ PDF Parsing Error:', error.message);
        
        // Return cached content if available, even if stale
        if (cachedContent) {
            console.log("⚠️ Using stale cached content due to error");
            return cachedContent;
        }
        
        // Return fallback content as last resort
        console.log("🔄 Using comprehensive fallback content");
        return getFallbackContent();
    }
}

// Enhanced fallback content (keeping your existing comprehensive content)
function getFallbackContent() {
    console.log("📋 Using enhanced fallback content - PDF not available");
    
    return `UK GLOBAL TALENT VISA GUIDE - DIGITAL TECHNOLOGY ROUTE

OVERVIEW
The UK Global Talent visa is designed for individuals who are leaders or potential leaders in digital technology. This route is endorsed by Tech Nation and allows successful applicants to live and work in the UK without employer sponsorship.

ELIGIBILITY REQUIREMENTS

Basic Requirements:
• Must have at least 5 years of experience working in the digital technology sector
• Must be able to demonstrate exceptional talent or exceptional promise in digital technology
• Must provide evidence that shows work is IN digital technology, not just USING digital technology as a tool
• Must meet the mandatory criteria and at least 2 of the 4 optional criteria

ROUTES AVAILABLE

1. Exceptional Talent Route (for established leaders):
An applicant evidencing EXCEPTIONAL TALENT must show they have been recognised as a leading talent in the digital technology sector in the last 5 years.

2. Exceptional Promise Route (for emerging leaders):
An applicant evidencing EXCEPTIONAL PROMISE must show they have been recognised as having potential to be a leading talent in the digital technology field in the last 5 years, and be at an early stage in their career.

MANDATORY CRITERIA (ALL applicants must provide)

1. Valid passport or national identity card
2. A CV highlighting career and achievements in digital technology (maximum 3 pages)
3. Personal statement (maximum 1,000 words) explaining how you meet the criteria
4. Three letters of recommendation from established leaders in the digital technology sector

OPTIONAL CRITERIA (must meet at least 2 of 4)

Criterion 1: Evidence of recognition for work outside your immediate occupation that has contributed to the advancement of the sector
Criterion 2: Evidence of genuine expertise in digital technology, demonstrated through professional experience and recognition by expert peers
Criterion 3: Evidence of academic contributions through research endorsed by expert peers, or demonstrable commercial successes in digital technology
Criterion 4: Evidence of innovation in digital technology that has led to new or significantly improved products, technologies, or methodology

APPLICATION PROCESS

Stage 1: Tech Nation Endorsement Application
• Cost: £561
• Processing time: 8-12 weeks (standard processing)

Stage 2: Home Office Visa Application (after endorsement approval)
• Cost: £205
• Processing time: 3 weeks (outside UK), 8 weeks (inside UK)

For detailed guidance and requirements, applicants should refer to official Tech Nation documentation.`;
}

// Keep your existing export functions
export function clearCache() {
    cachedContent = null;
    cacheTimestamp = null;
    console.log("🗑️ PDF content cache cleared");
}

export function getCacheStatus() {
    return {
        hasCachedContent: !!cachedContent,
        cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
        cacheSize: cachedContent ? cachedContent.length : 0,
        isStale: cacheTimestamp ? (Date.now() - cacheTimestamp > CACHE_DURATION) : null
    };
}

export function validatePDFContent(content) {
    if (!content || typeof content !== 'string') {
        return false;
    }
    
    if (content.length < 1000) {
        return false;
    }
    
    const requiredTerms = [
        'tech nation',
        'digital technology',
        'exceptional talent',
        'exceptional promise',
        'global talent visa'
    ];
    
    const contentLower = content.toLowerCase();
    const foundTerms = requiredTerms.filter(term => contentLower.includes(term));
    
    return foundTerms.length >= 3;
}

export { getFallbackContent };