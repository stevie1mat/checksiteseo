"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { User, Lock, Trash2, Mail, Shield, Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import QRCode from "qrcode"


export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState("")

    // Password Update State
    const [newPassword, setNewPassword] = useState("")
    const [updatingPassword, setUpdatingPassword] = useState(false)

    // 2FA State
    const [mfaEnabled, setMfaEnabled] = useState(false)
    const [factors, setFactors] = useState<any[]>([])
    const [enrolling, setEnrolling] = useState(false)
    const [enrollmentData, setEnrollmentData] = useState<any>(null)
    const [qrCodeUrl, setQrCodeUrl] = useState("")
    const [verifyCode, setVerifyCode] = useState("")
    const [verifying, setVerifying] = useState(false)
    const [showEnrollDialog, setShowEnrollDialog] = useState(false)

    const supabase = createClient()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const fetchUserAndFactors = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setProfile(profile)
                    setName(profile.full_name || "")
                }

                // Fetch MFA Factors
                const { data: factors, error } = await supabase.auth.mfa.listFactors()
                if (factors) {
                    setFactors(factors.all)
                    const totpFactor = factors.all.find(f => f.factor_type === 'totp' && f.status === 'verified')
                    setMfaEnabled(!!totpFactor)
                }
            }
            setLoading(false)
        }
        fetchUserAndFactors()
    }, [supabase])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdatingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error

            toast({
                title: "Password Updated",
                description: "Your password has been changed successfully."
            })
            setNewPassword("")
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            })
        } finally {
            setUpdatingPassword(false)
        }
    }

    const handleUpdateProfile = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: name })
                .eq('id', user.id)

            if (error) throw error

            toast({
                title: "Profile updated",
                description: "Your profile information has been saved successfully.",
            })
            router.refresh()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update profile",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        toast({
            variant: "destructive",
            title: "Action Restricted",
            description: "Please contact support to delete your account permanently.",
        })
    }

    // 2FA Handlers
    const handleEnableMFA = async () => {
        if (mfaEnabled) {
            // Disable MFA logic
            try {
                const factor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified')
                if (!factor) return

                const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
                if (error) throw error

                setMfaEnabled(false)
                // Refresh factors
                const { data: updatedFactors } = await supabase.auth.mfa.listFactors()
                if (updatedFactors) setFactors(updatedFactors.all)

                toast({
                    title: "2FA Disabled",
                    description: "Two-factor authentication has been turned off."
                })
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message
                })
            }
            return
        }

        // Enable MFA - Start Enrollment
        setEnrolling(true)
        try {
            // cleanup any existing unverified factors
            const { data: factorsToDelete } = await supabase.auth.mfa.listFactors()
            if (factorsToDelete?.all) {
                const unverified = factorsToDelete.all.filter(f => f.factor_type === 'totp' && f.status === 'unverified')
                for (const f of unverified) {
                    await supabase.auth.mfa.unenroll({ factorId: f.id })
                }
            }

            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            })
            if (error) throw error

            setEnrollmentData(data)

            // Generate QR Code
            if (data.totp.uri) {
                const url = await QRCode.toDataURL(data.totp.uri)
                setQrCodeUrl(url)
            }

            setShowEnrollDialog(true)

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            })
        } finally {
            setEnrolling(false)
        }
    }

    const handleVerifyMFA = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!enrollmentData) return

        setVerifying(true)
        try {
            const { data, error } = await supabase.auth.mfa.challenge({ factorId: enrollmentData.id })
            if (error) throw error

            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId: enrollmentData.id,
                challengeId: data.id,
                code: verifyCode
            })
            if (verifyError) throw verifyError

            // Success
            setMfaEnabled(true)
            setShowEnrollDialog(false)
            setVerifyCode("")
            // Refresh factors
            const { data: updatedFactors } = await supabase.auth.mfa.listFactors()
            if (updatedFactors) setFactors(updatedFactors.all)

            toast({
                title: "2FA Enabled",
                description: "Two-factor authentication is now active."
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error.message
            })
        } finally {
            setVerifying(false)
        }
    }


    if (loading) {
        return <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
    }

    return (
        <div className="space-y-8 w-full pb-12">
            <div>
                <h1 className="font-serif text-3xl text-[#224034]">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account preferences and profile.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Profile Section */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-600" />
                            <CardTitle className="text-lg">Profile Information</CardTitle>
                        </div>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="flex items-center gap-2 max-w-md">
                                {/* <Mail className="w-4 h-4 text-slate-400" /> */}
                                <Input id="email" value={user?.email || ""} disabled className="bg-slate-50 text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-400">Email cannot be changed directly.</p>
                        </div>
                        <div className="grid gap-2 max-w-md">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex justify-end py-3">
                        <Button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="bg-[#224034] hover:bg-[#1b3329] text-white"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>

                {/* Security Section */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            <CardTitle className="text-lg">Security</CardTitle>
                        </div>
                        <CardDescription>Manage your password and security settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Password Change */}
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">Password</h4>
                                    <p className="text-sm text-slate-500">Update your password securely.</p>
                                </div>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Change Password</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-[#fafafa]">
                                    <DialogHeader>
                                        <DialogTitle className="font-serif text-2xl text-[#224034]">Update Password</DialogTitle>
                                        <DialogDescription className="text-slate-500">
                                            Enter your new password below. It must be at least 6 characters long.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUpdatePassword} className="space-y-6 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password" className="text-slate-700 font-medium">New Password</Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                minLength={6}
                                                required
                                                className="bg-slate-200/50 border-slate-200 focus-visible:ring-[#224034]"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={updatingPassword}
                                                className="w-full sm:w-auto bg-[#224034] hover:bg-[#1b3329] text-white"
                                            >
                                                {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Update Password
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* 2FA Toggle */}
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
                                    <p className="text-sm text-slate-500">Secure your account with 2FA.</p>
                                </div>
                            </div>
                            {mfaEnabled ? (
                                <Button variant="outline" onClick={handleEnableMFA} className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                                    Disable 2FA
                                </Button>
                            ) : (
                                <Button variant="default" onClick={handleEnableMFA} className="bg-[#224034] hover:bg-[#1b3329] text-white">
                                    Enable 2FA
                                </Button>
                            )}
                        </div>

                        {/* Enrollment Dialog */}
                        <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                            <DialogContent className="sm:max-w-md bg-[#fafafa]">
                                <DialogHeader>
                                    <DialogTitle className="font-serif text-2xl text-[#224034]">Setup 2FA</DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                        Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the code below.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                    {qrCodeUrl && (
                                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                        </div>
                                    )}
                                    <div className="text-xs text-slate-500 text-center max-w-xs break-all">
                                        Or enter secret: <span className="font-mono bg-slate-200 px-1 rounded">{enrollmentData?.totp?.secret}</span>
                                    </div>
                                </div>

                                <form onSubmit={handleVerifyMFA} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="verify-code" className="text-slate-700 font-medium">Verification Code</Label>
                                        <Input
                                            id="verify-code"
                                            value={verifyCode}
                                            onChange={(e) => setVerifyCode(e.target.value)}
                                            placeholder="123456"
                                            maxLength={6}
                                            required
                                            className="bg-slate-200/50 border-slate-200 focus-visible:ring-[#224034] text-center tracking-widest text-lg"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={verifying}
                                            className="w-full bg-[#224034] hover:bg-[#1b3329] text-white"
                                        >
                                            {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            Verify & Activate
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-100 bg-red-50/10 col-span-1 md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" />
                            <CardTitle className="text-lg text-red-900">Danger Zone</CardTitle>
                        </div>
                        <CardDescription>Irreversible actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-slate-900">Delete Account</h4>
                                <p className="text-sm text-slate-500">Once deleted, your account and all data will be removed forever.</p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">Delete Account</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                                            Delete Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
