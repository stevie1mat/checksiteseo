"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, Check, Loader2 } from "lucide-react";

interface ApplicationDialogProps {
    jobTitle: string;
    children: React.ReactNode;
}

export function ApplicationDialog({ jobTitle, children }: ApplicationDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // append the job title so the backend knows which job
        formData.append("job_title", jobTitle);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/careers/apply`, {
                method: "POST",
                body: formData, // FormData automatically sets Content-Type to multipart/form-data
            });

            if (!res.ok) throw new Error("Failed to submit application");

            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
                setFileName(null);
            }, 2000);
        } catch (error) {
            console.error(error);
            alert("Failed to send application. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white text-slate-900 border-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-[#224034]">
                        Apply for {jobTitle}
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-[#224034]">Application Sent!</h3>
                        <p className="text-slate-500 text-center">
                            Thanks for applying. We'll review your info and get back to you soon.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" name="first_name" required className="bg-slate-50 border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input id="last_name" name="last_name" required className="bg-slate-50 border-slate-200" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required className="bg-slate-50 border-slate-200" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume (PDF, DOCX)</Label>
                            <label className="flex items-center justify-center w-full h-32 px-4 transition bg-slate-50 border-2 border-slate-200 border-dashed rounded-md appearance-none cursor-pointer hover:border-emerald-400 focus:outline-none">
                                <div className="flex flex-col items-center space-y-2">
                                    {fileName ? (
                                        <>
                                            <Check className="w-8 h-8 text-emerald-500" />
                                            <span className="font-medium text-emerald-600">{fileName}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-slate-400" />
                                            <span className="font-medium text-slate-600">
                                                Click to upload resume
                                            </span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    name="resume"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    required
                                />
                            </label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
                            <Textarea
                                id="cover_letter"
                                name="cover_letter"
                                className="min-h-[100px] bg-slate-50 border-slate-200"
                                placeholder="Tell us why you're a great fit..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-[#224034] text-white hover:bg-[#1a3329]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
