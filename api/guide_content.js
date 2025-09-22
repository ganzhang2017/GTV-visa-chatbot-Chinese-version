// api/guide_content.js - Minimal safe version
export async function getNotionPageContent() {
    return `UK GLOBAL TALENT VISA GUIDE - DIGITAL TECHNOLOGY ROUTE

BASIC REQUIREMENTS:
• 5+ years digital technology experience
• Exceptional talent or promise demonstration
• Meet mandatory criteria + 2 optional criteria

MANDATORY CRITERIA:
• Valid passport
• CV (max 3 pages)
• Personal statement (max 1000 words)
• 3 recommendation letters

OPTIONAL CRITERIA (need 2 of 4):
1. Recognition for sector advancement
2. Technical expertise with peer recognition
3. Academic contributions or commercial success
4. Innovation in digital technology

APPLICATION COSTS:
• Tech Nation endorsement: £561
• Home Office visa: £205
• Healthcare surcharge: £1,035/year
• Total: £766 + healthcare surcharge

PROCESSING TIME:
• Tech Nation: 8-12 weeks
• Home Office: 3-8 weeks
• Total process: 4-7 months

EVIDENCE REQUIREMENTS:
• Maximum 10 pieces across all criteria
• Focus on external recognition
• Quantifiable achievements preferred
• Recent evidence (last 5 years)

NEXT STEPS:
1. Assess eligibility
2. Choose strongest 2 criteria
3. Collect evidence
4. Secure recommenders
5. Submit application`;
}

export function clearCache() {
    console.log("Cache cleared");
}

export function getCacheStatus() {
    return { status: "active" };
}

export function validatePDFContent() {
    return true;
}

export function getFallbackContent() {
    return getNotionPageContent();
}