"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Info, Code, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface SchemaFixerProps {
    domain: string
    entityType?: string
    primaryEntity?: string
    missingAttributes: string[]
}

export function SchemaFixer({ domain, entityType = "Organization", primaryEntity, missingAttributes }: SchemaFixerProps) {
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: primaryEntity || "",
        sameAs: "", // comma separated for input, array for output
        location: "",
        founders: "", // comma separated for input
        url: domain.startsWith('http') ? domain : `https://${domain}`
    })

    // JSON-LD State
    const [jsonLd, setJsonLd] = useState("")

    // Update JSON-LD when form changes
    useEffect(() => {
        const type = entityType === 'Person' ? 'Person' : 'Organization'

        const schema: any = {
            "@context": "https://schema.org",
            "@type": type,
            "name": formData.name || "My Organization",
            "url": formData.url
        }

        // Add optional fields if they have values or if they were missing (to encourage filling them)
        if (formData.sameAs) {
            const urls = formData.sameAs.split(',').map(u => u.trim()).filter(u => u)
            if (urls.length > 0) schema.sameAs = urls
        }

        if (type === 'Organization') {
            if (formData.location) {
                schema.address = {
                    "@type": "PostalAddress",
                    "addressLocality": formData.location
                }
            }
            if (formData.founders) {
                const foundersList = formData.founders.split(',').map(f => f.trim()).filter(f => f)
                if (foundersList.length === 1) {
                    schema.founder = {
                        "@type": "Person",
                        "name": foundersList[0]
                    }
                } else if (foundersList.length > 1) {
                    schema.founder = foundersList.map(f => ({
                        "@type": "Person",
                        "name": f
                    }))
                }
            }
        }

        // Pretty print
        setJsonLd(JSON.stringify(schema, null, 2))

    }, [formData, entityType])

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonLd)
        setCopied(true)
        toast({
            title: "Copied to clipboard",
            description: "Paste this into your website's <head> section or GTM.",
        })
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left: Smart Form */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-[#1A4036] flex items-center gap-2">
                        <Info className="w-5 h-5 text-emerald-600" />
                        Schema Builder
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Fill in the missing details to generate an AEO-compliant Schema.
                    </p>
                </div>

                <Card className="p-6 border-emerald-100 bg-white shadow-sm space-y-5">

                    {/* Always show Name */}
                    <div className="space-y-2">
                        <Label className="text-slate-700">Entity Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="focus-visible:ring-emerald-400"
                            placeholder="e.g. My Brand Name"
                        />
                    </div>

                    {/* Conditional inputs based on missing attributes or type */}

                    {/* SAME AS (Socials) */}
                    {(missingAttributes.includes('sameAs') || !formData.sameAs) && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                            <div className="flex justify-between">
                                <Label className="text-slate-700">Social Profiles (SameAs)</Label>
                                {missingAttributes.includes('sameAs') && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100">Missing</Badge>}
                            </div>
                            <Input
                                value={formData.sameAs}
                                onChange={(e) => setFormData(prev => ({ ...prev, sameAs: e.target.value }))}
                                className="focus-visible:ring-emerald-400 border-dashed border-emerald-200 bg-emerald-50/30"
                                placeholder="https://twitter.com/..., https://linkedin.com/..."
                            />
                            <p className="text-[10px] text-slate-400">Comma separated URLs</p>
                        </div>
                    )}

                    {/* LOCATION (For Org) */}
                    {entityType !== 'Person' && (missingAttributes.includes('location') || missingAttributes.includes('address') || !formData.location) && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-2 delay-75">
                            <div className="flex justify-between">
                                <Label className="text-slate-700">Organization HQ / City</Label>
                                {(missingAttributes.includes('location') || missingAttributes.includes('address')) && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100">Missing</Badge>}
                            </div>
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                className="focus-visible:ring-emerald-400 border-dashed border-emerald-200 bg-emerald-50/30"
                                placeholder="e.g. Toronto, Canada"
                            />
                        </div>
                    )}

                    {/* FOUNDERS (For Org) */}
                    {entityType !== 'Person' && (missingAttributes.includes('founders') || missingAttributes.includes('founder') || !formData.founders) && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-2 delay-150">
                            <div className="flex justify-between">
                                <Label className="text-slate-700">Founder Name(s)</Label>
                                {(missingAttributes.includes('founders') || missingAttributes.includes('founder')) && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100">Missing</Badge>}
                            </div>
                            <Input
                                value={formData.founders}
                                onChange={(e) => setFormData(prev => ({ ...prev, founders: e.target.value }))}
                                className="focus-visible:ring-emerald-400 border-dashed border-emerald-200 bg-emerald-50/30"
                                placeholder="e.g. John Doe, Jane Smith"
                            />
                        </div>
                    )}

                </Card>
            </div>

            {/* Right: Code Preview */}
            <div className="flex flex-col h-full space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <Code className="w-5 h-5 text-slate-400" />
                        Code Preview
                    </h3>
                    <Button
                        size="sm"
                        onClick={handleCopy}
                        className={`gap-2 font-semibold !text-white transition-all duration-300 ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1A4036] hover:bg-[#2a4e40]'}`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Optimized Schema"}
                    </Button>
                </div>

                <div className="grow relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-[#1e1e1e] group">
                    <div className="absolute top-0 left-0 w-full h-8 bg-[#2d2d2d] border-b border-[#3d3d3d] flex items-center px-4 gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                        <span className="ml-2 text-xs text-slate-400 font-mono">schema.jsonld</span>
                    </div>
                    <pre className="p-6 pt-12 text-sm font-mono text-emerald-50 overflow-auto custom-scrollbar h-full">
                        <code>{jsonLd}</code>
                    </pre>

                    {/* Helper Tip Overlay */}
                    {missingAttributes.length > 0 && formData.sameAs === "" && (
                        <div className="absolute bottom-4 right-4 bg-blue-600/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce pointer-events-none">
                            <Info className="w-3 h-3" />
                            Start typing to update code
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
