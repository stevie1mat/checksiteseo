export interface AEOReport {
    domain: string;
    scannedAt: string; // ISO Date
    status: 'completed' | 'processing' | 'failed';

    scores: {
        overall: number;
        technical: number;
        content: number;
        authority: number | 'Analysis'; // 'Analysis' is the placeholder text
    };

    technical: {
        robotsTxt: boolean; // Pass/Fail
        llmsTxt: boolean;   // Pass/Fail
        sitemap: string | null;
        schema: string[];   // e.g. ['Organization', 'Person']
        https: boolean;
    };

    agentEconomics: {
        totalTokens: number;
        indexCost: number;
        codeToTextRatio: number; // 0.15 = 15%
        bloatStatus: 'Healthy' | 'Bloated' | 'Moderate Bloat' | 'Critical Bloat' | 'Unknown';
        html_ratio?: string; // Adding this based on existing usages seen in SiteReportView
        code_bloat_score?: string; // Adding this based on existing usages seen in SiteReportView
        estimated_cost?: string; // Adding this to match existing usage
        total_tokens?: number; // Adding this to match existing usage if raw data comes this way
        boilerplate_ratio?: number; // Added
    };

    content: {
        readabilityGrade: number;
        questionTargetingScore: number; // 0-5
        missingAnswers: Array<{
            query: string;
            status: 'Missing' | 'Implied' | 'Explicit' | 'Explicitly Stated';
            draftAnswer?: string; // Optional: The AI generated draft
        }>;
        readabilityDetails?: string[]; // Added
        visualContextScore?: number; // Added
        freshnessScore?: number; // Added
        gap?: { data: any[] }; // To support existing structure if needed
    };

    authority: {
        eeat?: {
            hallucination_risk?: {
                level: 'High' | 'Low' | 'Medium';
                reason?: string;
                fix?: string;
            };
            signals?: string[]; // Added for Pros/Cons
        };
        knowledge_graph?: {
            data: {
                primary_entity?: string;
                type?: string;
                relationships?: {
                    worksFor?: string;
                    jobTitle?: string;
                    alumniOf?: string;
                    knowsAbout?: string[];
                    sameAs?: string[];
                    location?: string;
                    products?: string[];
                    founders?: string[];
                };
                missing_critical?: string[];
            }
        };
        ai_preview?: {
            query: string;
            response: string;
        };
    };

    knowledgeGraph: {
        primaryEntity: string;
        type: 'Person' | 'Organization';
        nodes: Array<{ label: string; type: string }>; // For the visualizer
        relationships?: any; // Added for legacy UI
        missing_critical?: string[]; // Added for legacy UI
    };

    competitors: {
        yourShare: number; // e.g. 12
        others: number;    // e.g. 60
    };
}
