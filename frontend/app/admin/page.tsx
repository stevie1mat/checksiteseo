"use client";

import { useState, useEffect } from "react";
import { Users, LayoutTemplate, Activity, ShieldCheck, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminStats = {
  total_users: number;
  total_sites: number;
  total_scans: number;
  landing_page_urls_scanned: number;
  recent_users: any[];
  recent_sites: any[];
  recent_landing_page_scans: any[];
};

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/stats`, {
        method: "GET",
        headers: {
          "x-admin-secret": password,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Invalid admin password");
      }

      const data = await response.json();
      setStats(data);
      setIsAuthenticated(true);
      
      // Store loosely in session storage just to survive hot reloads during session
      sessionStorage.setItem("admin_secret", password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Attempt auto-login if token is in session storage
  useEffect(() => {
    const savedPassword = sessionStorage.getItem("admin_secret");
    if (savedPassword && !isAuthenticated) {
      setPassword(savedPassword);
      // We don't automatically trigger login to avoid infinite loops on error, 
      // but the user can just hit enter.
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_secret");
    setIsAuthenticated(false);
    setStats(null);
    setPassword("");
  };

  // --- Login Screen ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
          <div className="flex justify-center mb-6 text-emerald-500">
            <Lock className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Panel</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Enter the master secret to view telemetry.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="bg-slate-900 border-slate-700 text-white h-12"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
        </div>
      </main>
    );
  }

  // --- Dashboard Screen ---
  return (
    <main className="min-h-screen bg-slate-900 text-slate-300 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CheckSite Telemetry</h1>
              <p className="text-slate-400 text-sm">Live database values and recent scans</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <LogOut className="w-4 h-4 mr-2" /> Lock
          </Button>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">{stats?.total_users || 0}</p>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <LayoutTemplate className="w-7 h-7" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Sites</p>
              <p className="text-3xl font-bold text-white">{stats?.total_sites || 0}</p>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Scans Run</p>
              <p className="text-3xl font-bold text-white">{stats?.total_scans || 0}</p>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Landing Page Scans</p>
              <p className="text-3xl font-bold text-white">{stats?.landing_page_urls_scanned || 0}</p>
            </div>
          </div>
        </div>

        {/* Data Tables Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Sites */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 bg-slate-800">
              <h2 className="text-lg font-bold text-white">Recent Logged-In Scans</h2>
            </div>
            <div className="overflow-x-auto p-0 flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">URL</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {stats?.recent_sites?.map((site, i) => (
                    <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-emerald-400 truncate max-w-[150px]">{site.url}</td>
                      <td className="px-6 py-4 text-[10px] font-mono text-slate-500 max-w-[120px] truncate">
                        {site.user_email || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium bg-slate-900 border ${
                          site.status === "completed" ? "text-emerald-400 border-emerald-500/30" : 
                          site.status === "error" ? "text-red-400 border-red-500/30" : 
                          "text-yellow-400 border-yellow-500/30"
                        }`}>
                          {site.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-mono">{site.aeo_score || "N/A"}</td>
                      <td className="px-6 py-4 text-slate-300 text-[11px]">
                        {site.created_at ? new Date(site.created_at).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recent_sites || stats.recent_sites.length === 0) && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No sites recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 bg-slate-800">
              <h2 className="text-lg font-bold text-white">Recent Signups</h2>
            </div>
            <div className="overflow-x-auto p-0 flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Plan</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {stats?.recent_users?.map((user, i) => (
                    <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400 text-xs">
                        {user.email || `${user.id.substring(0, 12)}...`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                          user.subscription_tier !== "free" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-700 text-slate-300"
                        }`}>
                          {user.subscription_tier || "free"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recent_users || stats.recent_users.length === 0) && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No users recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Data Tables Bottom Row */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Landing Page Scans */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 bg-slate-800">
              <h2 className="text-lg font-bold text-white">Recent Landing Page Scans (Anonymous)</h2>
              <p className="text-sm text-slate-400">These are scans initiated directly from the homepage by unauthenticated visitors.</p>
            </div>
            <div className="overflow-x-auto p-0 flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900/50 text-slate-400">
                   <tr>
                    <th className="px-6 py-4 font-medium">URL</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">IP/Device</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Date Run</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {stats?.recent_landing_page_scans?.map((scan, i) => (
                    <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-amber-400 truncate max-w-[200px]">{scan.url}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-white font-medium">{scan.city || "Unknown City"}</div>
                        <div className="text-slate-500 text-[10px]">{scan.country || "Unknown Country"}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-[10px] font-mono text-emerald-500/70">{scan.ip || "—"}</div>
                         <div className="text-[9px] text-slate-500 truncate max-w-[100px]" title={scan.ua}>{scan.ua || "unknown dev"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium bg-slate-900 border ${
                          scan.status === "completed" ? "text-emerald-400 border-emerald-500/30" : 
                          scan.status === "error" ? "text-red-400 border-red-500/30" : 
                          "text-yellow-400 border-yellow-500/30"
                        }`}>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-mono">{scan.aeo_score || "N/A"}</td>
                      <td className="px-6 py-4 text-slate-300 text-[11px]">
                        {scan.created_at ? new Date(scan.created_at).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recent_landing_page_scans || stats.recent_landing_page_scans.length === 0) && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No landing page scans recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
