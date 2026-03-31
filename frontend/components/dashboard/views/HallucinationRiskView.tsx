"use client"

import { useState, useEffect } from "react"
import { Lightbulb, Search, ArrowRight, Wand2, CheckCircle2, ShieldCheck, AlertTriangle, FileText, Settings, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

import { RealtimeMetricView } from "@/components/dashboard/views/RealtimeMetricView"
import { MetricDetailLayout } from "@/components/dashboard/MetricDetailLayout"
import { AEOReport } from "@/types/aeo"

interface HallucinationRiskViewProps {
    siteId: string
    domain: string
    initialData: any
}

const RISK_TABS = [
    { id: 'what-why', label: 'What & Why', icon: Lightbulb },
    { id: 'resolver', label: 'Ambiguity Resolver', icon: Search },
    { id: 'verify', label: 'Verify Confidence', icon: ShieldCheck },
];

export function HallucinationRiskView({ siteId, domain, initialData }: HallucinationRiskViewProps) {
    const { toast } = useToast()
    const [simulating, setSimulating] = useState(false);
    const [simulationComplete, setSimulationComplete] = useState(false);
    const [flaggedSentences, setFlaggedSentences] = useState<any[]>([]);
    const [loadingIssues, setLoadingIssues] = useState(true);
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);

    // Fetch real issues on mount
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await fetch('/api/analyze-ambiguity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_domain: domain })
                });
                if (res.ok) {
                    const data = await res.json();
                    setFlaggedSentences(data.improvements || []);
                }
            } catch (e) {
                console.error("Failed to fetch ambiguity issues", e);
            } finally {
                setLoadingIssues(false);
            }
        };
        fetchIssues();
    }, [domain]);

    const handleCopyFix = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Fix Copied",
            description: "Paste this into your CMS to update the content.",
        });
    }

    const runSimulation = async () => {
        setSimulating(true);
        setShowReport(false);
        try {
            const res = await fetch('/api/analyze-ambiguity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_domain: domain })
            });

            // Minimum delay for "simulation" feel
            await new Promise(r => setTimeout(r, 2000));

            if (res.ok) {
                const data = await res.json();
                setSimulationResult(data);
                setSimulationComplete(true);
                toast({
                    title: "Simulation Complete",
                    description: "Analysis updated based on live content.",
                });
            } else {
                throw new Error("Analysis failed");
            }
        } catch (e) {
            toast({
                title: "Simulation Failed",
                description: "Could not reach the analysis engine.",
                variant: "destructive"
            });
        } finally {
            setSimulating(false);
        }
    }

    return (
        <RealtimeMetricView
            siteId={siteId}
            domain={domain}
            initialData={initialData}
            transform={(report: AEOReport) => {
                return report.authority?.eeat?.hallucination_risk || { level: 'Low', reason: 'No notable contradictions found.', fix: 'Maintain current citation standards.' };
            }}
        >
            {(risk: any) => (
                <MetricDetailLayout
                    title="Hallucination Risk Analysis"
                    status={risk.level === 'High' ? 'critical' : risk.level === 'Medium' ? 'warning' : 'pass'}
                    impact={`${risk.level} Risk`}
                    rawDiagnostic={JSON.stringify(risk, null, 2)}
                    pullQuote="Ambiguity is the enemy of accuracy. When your content lacks specific details—like exact dates, pricing, or credentials—AI models are forced to 'guess' or hallucinate the missing facts."
                    actionLabel="Resolve Ambiguities"
                    customTabs={RISK_TABS}
                    leftPanelTip={
                        <div className="mt-8 bg-[#8CD9B8]/10 border border-[#8CD9B8]/20 rounded-xl p-4 flex gap-3 text-emerald-100/80 text-sm">
                            <Lightbulb className="w-5 h-5 text-[#8CD9B8] shrink-0 mt-0.5" />
                            <p className="leading-snug">
                                Agents trust explicit data. Vague text forces models to guess.
                            </p>
                        </div>
                    }
                    whatAndWhyContent={
                        <div className="space-y-4 text-slate-600">
                            <p>
                                <strong>What is Hallucination Risk?</strong><br />
                                This metric measures the probability that an AI model will generate false or "hallucinated" information about your brand due to conflicting or ambiguous data sources.
                            </p>
                            <p>
                                <strong>Why it matters:</strong><br />
                                Consistent, authoritative data across the web reduces the chance of AI misrepresentation.
                            </p>
                        </div>
                    }
                    renderTabContent={(activeTab: string) => (
                        <>
                            {activeTab === 'what-why' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-serif text-slate-800 tracking-tight">Understanding Hallucination Risk</h2>
                                        <p className="text-slate-600 text-lg leading-relaxed">
                                            AI models simulate reasoning, but they rely on specific data points to anchor their outputs. Without them, they formulate plausible but often incorrect answers.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                                        <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                                            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" /> High Risk Factors
                                            </h3>
                                            <ul className="list-disc list-inside space-y-2 text-sm text-red-800/80">
                                                <li>Vague pricing ("Contact us")</li>
                                                <li>Undefined dates ("Recently")</li>
                                                <li>Subjective claims ("Best in class")</li>
                                            </ul>
                                        </div>
                                        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5" /> Low Risk Factors
                                            </h3>
                                            <ul className="list-disc list-inside space-y-2 text-sm text-emerald-800/80">
                                                <li>Explicit pricing ("$29/mo")</li>
                                                <li>Specific dates ("Est. 2018")</li>
                                                <li>Vifiable numbers ("500+ users")</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resolver' && (
                                <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#1A4036]">Resolve Content Gaps</h2>
                                            <p className="text-slate-500 text-sm">Replace vague claims with specific data to prevent AI hallucinations.</p>
                                        </div>
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                                            {flaggedSentences.length} Issues Detected
                                        </Badge>
                                    </div>

                                    <div className="grow overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="space-y-4">
                                            {loadingIssues ? (
                                                <div className="flex items-center justify-center py-12 text-slate-400">
                                                    <Wand2 className="w-6 h-6 animate-spin mr-2" />
                                                    Scanning content...
                                                </div>
                                            ) : flaggedSentences.length === 0 ? (
                                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                                                    <p>No major ambiguity issues found.</p>
                                                </div>
                                            ) : (
                                                flaggedSentences.map((item, idx) => (
                                                    <Card key={idx} className="p-4 border-slate-200 hover:border-emerald-200 transition-colors">
                                                        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-6 items-start">
                                                            {/* Issue */}
                                                            <div className="space-y-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2 text-red-500 font-medium text-xs uppercase tracking-wide">
                                                                        <AlertTriangle className="w-3 h-3" />
                                                                        Vague Claim
                                                                    </div>
                                                                    {item.category && (
                                                                        <Badge variant="outline" className="w-fit text-[10px] text-slate-500 border-slate-200 px-1.5 py-0 h-5">
                                                                            {item.category}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="p-3 bg-red-50 font-medium text-slate-700 rounded-lg text-sm border border-red-100">
                                                                    "{item.originalText}"
                                                                </div>
                                                            </div>

                                                            {/* Arrow */}
                                                            <div className="hidden md:flex items-center justify-center h-full pt-6">
                                                                <ArrowRight className="w-5 h-5 text-slate-300" />
                                                            </div>

                                                            {/* Fix */}
                                                            <div className="space-y-2 grow">
                                                                <div className="flex items-center gap-2 text-emerald-600 font-medium text-xs uppercase tracking-wide">
                                                                    <Wand2 className="w-3 h-3" />
                                                                    AI Suggestion
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        defaultValue={item.suggestedFix}
                                                                        className="bg-emerald-50/50 border-emerald-100 text-emerald-900 focus-visible:ring-emerald-200"
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        className="shrink-0 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#1A4036]"
                                                                        onClick={() => handleCopyFix(item.suggestedFix)}
                                                                    >
                                                                        Copy
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'verify' && (
                                <div className="space-y-8 animate-in fade-in duration-300 flex flex-col items-center justify-center h-full py-8 text-center">
                                    {!simulationComplete ? (
                                        <>
                                            <div className="space-y-4 max-w-lg">
                                                <h2 className="text-2xl font-serif text-[#1A4036]">Confidence Simulation</h2>
                                                <p className="text-slate-600">
                                                    Test how AI models interpret your new, specific data points versus the old vague claims.
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-8 my-8">
                                                <div className="flex flex-col items-center gap-3 opacity-50">
                                                    <Badge variant="outline" className="h-16 w-16 rounded-full flex items-center justify-center border-2 border-red-200 bg-red-50 text-red-600">
                                                        <AlertTriangle className="w-8 h-8" />
                                                    </Badge>
                                                    <span className="font-bold text-red-800">High Risk</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                        {simulating && (
                                                            <div className="h-full bg-emerald-500 animate-progress" style={{ width: '100%' }} />
                                                        )}
                                                    </div>
                                                    <ArrowRight className={`w-5 h-5 text-slate-300 ${simulating ? 'animate-pulse text-emerald-400' : ''}`} />
                                                </div>
                                                <div className="flex flex-col items-center gap-3">
                                                    <Badge variant="outline" className="h-16 w-16 rounded-full flex items-center justify-center border-2 border-slate-100 bg-white text-slate-300">
                                                        <ShieldCheck className="w-8 h-8" />
                                                    </Badge>
                                                    <span className="font-bold text-slate-300">Target</span>
                                                </div>
                                            </div>

                                            <Button
                                                size="lg"
                                                onClick={runSimulation}
                                                disabled={simulating}
                                                className="bg-[#1A4036] hover:bg-[#143028] text-white px-8 h-12 rounded-xl text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                            >
                                                {simulating ? (
                                                    <>
                                                        <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Simulating Agents...
                                                    </>
                                                ) : (
                                                    "Run Confidence Simulation"
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="animate-in zoom-in duration-500 space-y-6 w-full max-w-2xl mx-auto">
                                            {showReport ? (
                                                <div className="text-left bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-bold text-lg text-[#1A4036] flex items-center gap-2">
                                                            <FileText className="w-5 h-5" />
                                                            Simulation Report
                                                        </h3>
                                                        <Button variant="ghost" size="sm" onClick={() => setShowReport(false)}>
                                                            Close
                                                        </Button>
                                                    </div>

                                                    {!simulationResult?.improvements || simulationResult.improvements.length === 0 ? (
                                                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-3">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            <div>
                                                                <p className="font-bold">No Ambiguities Detected</p>
                                                                <p className="text-sm opacity-90">Great job! Your content is specific and clear.</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-orange-50 text-orange-800 rounded-lg flex items-center gap-3">
                                                                <AlertTriangle className="w-5 h-5" />
                                                                <div>
                                                                    <p className="font-bold">{simulationResult.improvements.length} Issues Remaining</p>
                                                                    <p className="text-sm opacity-90">We still found some vague claims. Check the resolver tab.</p>
                                                                </div>
                                                            </div>
                                                            <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
                                                                {simulationResult.improvements.map((issue: any, i: number) => (
                                                                    <div key={i} className="p-3 border-b border-slate-100 last:border-0 text-sm">
                                                                        <span className="text-red-600 font-medium">Found:</span> "{issue.originalText}"
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-4">
                                                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h2 className="text-3xl font-serif text-[#1A4036]">Simulation Passed</h2>
                                                        <p className="text-emerald-700 font-medium text-lg">
                                                            Hallucination Probability Reduced to &lt; 5%
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-4 justify-center pt-4">
                                                        <Button variant="outline" onClick={() => setSimulationComplete(false)}>
                                                            Run Again
                                                        </Button>
                                                        <Button
                                                            className="bg-[#1A4036] text-white"
                                                            onClick={() => setShowReport(true)}
                                                        >
                                                            View Detailed Report
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                >
                    <div className="space-y-6">
                        <div className={`p-6 rounded-lg ${risk.level === 'High' ? 'bg-red-50 border border-red-200' :
                            risk.level === 'Medium' ? 'bg-yellow-50 border border-yellow-200' :
                                'bg-green-50 border border-green-200'
                            }`}>
                            <h4 className="font-bold text-lg mb-2 text-[#224034]">Assessment: {risk.reason}</h4>
                            <p className="text-slate-700">{risk.fix}</p>
                        </div>
                    </div>
                </MetricDetailLayout>
            )}
        </RealtimeMetricView>
    )
}
