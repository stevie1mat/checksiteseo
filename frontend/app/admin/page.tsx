"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Activity, ChevronLeft, ChevronRight, LayoutTemplate, Lock, LogOut, Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminStats = {
  total_users: number;
  total_sites: number;
  total_scans: number;
  landing_page_urls_scanned: number;
};

type AdminRecord = {
  id: string;
  email?: string;
  subscription_tier?: string;
  url?: string;
  user_email?: string;
  status?: string;
  aeo_score?: number | null;
  created_at?: string;
  city?: string;
  country?: string;
  ip?: string;
  ua?: string;
};

type RecordsResponse = {
  items: AdminRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type Section = "users" | "authenticated_scans" | "anonymous_scans";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const selectClass = "h-10 rounded-md border border-slate-600 bg-slate-900 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

function useAdminRecords(
  section: Section,
  secret: string,
  active: boolean,
  page: number,
  pageSize: number,
  search: string,
  filterName: "status" | "plan",
  filterValue: string,
  setPage: (page: number) => void,
) {
  const [data, setData] = useState<RecordsResponse>({ items: [], total: 0, page: 1, page_size: pageSize, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ section, page: String(page), page_size: String(pageSize), search, [filterName]: filterValue });

      try {
        const response = await fetch(`${API_URL}/admin/records?${params}`, {
          headers: { "x-admin-secret": secret },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load records");
        const result: RecordsResponse = await response.json();
        if (page > result.total_pages) {
          setPage(result.total_pages);
          return;
        }
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load records");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, filterName, filterValue, page, pageSize, search, secret, section, setPage]);

  return { data, loading, error };
}

function TableControls({ search, onSearch, filter, onFilter, filterLabel, options, pageSize, onPageSize }: {
  search: string;
  onSearch: (value: string) => void;
  filter: string;
  onFilter: (value: string) => void;
  filterLabel: string;
  options: { value: string; label: string }[];
  pageSize: number;
  onPageSize: (value: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input aria-label="Search records" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search by URL or email..." className="border-slate-600 bg-slate-900 pl-9 text-white placeholder:text-slate-500" />
      </div>
      <select aria-label={filterLabel} value={filter} onChange={(event) => onFilter(event.target.value)} className={selectClass}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <select aria-label="Rows per page" value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))} className={selectClass}>
        <option value={5}>5 rows</option><option value={10}>10 rows</option><option value={25}>25 rows</option><option value={50}>50 rows</option>
      </select>
    </div>
  );
}

function Pagination({ page, totalPages, total, loading, onPage }: {
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
      <span>{loading ? "Loading..." : `${total.toLocaleString()} record${total === 1 ? "" : "s"}`}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" aria-label="Previous page" onClick={() => onPage(page - 1)} disabled={loading || page <= 1} className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="min-w-20 text-center">Page {page} of {totalPages}</span>
        <Button variant="outline" size="sm" aria-label="Next page" onClick={() => onPage(page + 1)} disabled={loading || page >= totalPages} className="border-slate-600 bg-transparent text-slate-300 hover:bg-slate-700"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function EmptyRow({ colSpan, loading, error }: { colSpan: number; loading: boolean; error: string }) {
  return <tr><td colSpan={colSpan} className={`px-6 py-8 text-center ${error ? "text-red-400" : "text-slate-500"}`}>{error || (loading ? "Loading records..." : "No matching records.")}</td></tr>;
}

function formatDateRun(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  const day = date.getDate();
  const remainder = day % 100;
  const suffix = remainder >= 11 && remainder <= 13
    ? "th"
    : day % 10 === 1
      ? "st"
      : day % 10 === 2
        ? "nd"
        : day % 10 === 3
          ? "rd"
          : "th";
  const month = date.toLocaleString("en-GB", { month: "short" });

  return `${day}${suffix} ${month}, ${date.getFullYear()}`;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);

  const [scanPage, setScanPage] = useState(1);
  const [scanPageSize, setScanPageSize] = useState(10);
  const [scanSearch, setScanSearch] = useState("");
  const [scanStatus, setScanStatus] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userSearch, setUserSearch] = useState("");
  const [userPlan, setUserPlan] = useState("all");
  const [anonymousPage, setAnonymousPage] = useState(1);
  const [anonymousPageSize, setAnonymousPageSize] = useState(10);
  const [anonymousSearch, setAnonymousSearch] = useState("");
  const [anonymousStatus, setAnonymousStatus] = useState("all");

  const scans = useAdminRecords("authenticated_scans", password, isAuthenticated, scanPage, scanPageSize, scanSearch, "status", scanStatus, setScanPage);
  const users = useAdminRecords("users", password, isAuthenticated, userPage, userPageSize, userSearch, "plan", userPlan, setUserPage);
  const anonymous = useAdminRecords("anonymous_scans", password, isAuthenticated, anonymousPage, anonymousPageSize, anonymousSearch, "status", anonymousStatus, setAnonymousPage);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/stats`, { headers: { "x-admin-secret": password } });
      if (!response.ok) throw new Error("Invalid admin password");
      setStats(await response.json());
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_secret", password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = sessionStorage.getItem("admin_secret");
    if (savedPassword && !isAuthenticated) setPassword(savedPassword);
  }, [isAuthenticated]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_secret");
    setIsAuthenticated(false);
    setStats(null);
    setPassword("");
  };

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "analyzing", label: "Analyzing" },
    { value: "error", label: "Error" },
  ];

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
          <div className="mb-6 flex justify-center text-emerald-500"><Lock className="h-12 w-12" /></div>
          <h1 className="mb-2 text-center text-2xl font-bold text-white">Admin Panel</h1>
          <p className="mb-8 text-center text-sm text-slate-400">Enter the master secret to view telemetry.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="password" placeholder="Admin Password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus className="h-12 border-slate-700 bg-slate-900 text-white" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-500" disabled={loading}>{loading ? "Verifying..." : "Access Dashboard"}</Button>
          </form>
        </div>
      </main>
    );
  }

  const statusBadge = (status?: string) => (
    <span className={`rounded border bg-slate-900 px-2 py-1 text-xs font-medium ${status === "completed" ? "border-emerald-500/30 text-emerald-400" : status === "error" ? "border-red-500/30 text-red-400" : "border-yellow-500/30 text-yellow-400"}`}>{status || "unknown"}</span>
  );

  return (
    <main className="min-h-screen bg-slate-900 p-6 font-sans text-slate-300 md:p-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10"><ShieldCheck className="h-6 w-6 text-emerald-400" /></div>
            <div><h1 className="text-2xl font-bold text-white">CheckSite Telemetry</h1><p className="text-sm text-slate-400">Live database values and scan history</p></div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700"><LogOut className="mr-2 h-4 w-4" /> Lock</Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard label="Total Users" value={stats?.total_users} icon={<Users className="h-7 w-7" />} colorClasses="border-blue-500/20 bg-blue-500/10 text-blue-400" />
          <StatCard label="Total Sites" value={stats?.total_sites} icon={<LayoutTemplate className="h-7 w-7" />} colorClasses="border-emerald-500/20 bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Total Scans Run" value={stats?.total_scans} icon={<Activity className="h-7 w-7" />} colorClasses="border-purple-500/20 bg-purple-500/10 text-purple-400" />
          <StatCard label="Landing Page Scans" value={stats?.landing_page_urls_scanned} icon={<Activity className="h-7 w-7" />} colorClasses="border-amber-500/20 bg-amber-500/10 text-amber-400" />
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-lg">
            <div className="border-b border-slate-700 p-6">
              <h2 className="text-lg font-bold text-white">Logged-In Scans</h2>
              <TableControls search={scanSearch} onSearch={(value) => { setScanSearch(value); setScanPage(1); }} filter={scanStatus} onFilter={(value) => { setScanStatus(value); setScanPage(1); }} filterLabel="Scan status" options={statusOptions} pageSize={scanPageSize} onPageSize={(value) => { setScanPageSize(value); setScanPage(1); }} />
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="bg-slate-900/50 text-slate-400"><tr><th className="px-6 py-4 font-medium">URL</th><th className="px-6 py-4 font-medium">User</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Score</th><th className="px-6 py-4 font-medium">Date</th></tr></thead>
                <tbody className="divide-y divide-slate-700">
                  {scans.data.items.map((site) => <tr key={site.id} className="transition-colors hover:bg-slate-700/50"><td className="max-w-[180px] truncate px-6 py-4 font-medium text-emerald-400" title={site.url}>{site.url}</td><td className="max-w-[150px] truncate px-6 py-4 font-mono text-[10px] text-slate-500">{site.user_email || "—"}</td><td className="px-6 py-4">{statusBadge(site.status)}</td><td className="px-6 py-4 font-mono text-white">{site.aeo_score ?? "N/A"}</td><td className="px-6 py-4 text-[11px] text-slate-300">{site.created_at ? new Date(site.created_at).toLocaleString() : "N/A"}</td></tr>)}
                  {!scans.data.items.length && <EmptyRow colSpan={5} loading={scans.loading} error={scans.error} />}
                </tbody>
              </table>
            </div>
            <Pagination page={scanPage} totalPages={scans.data.total_pages} total={scans.data.total} loading={scans.loading} onPage={setScanPage} />
          </section>

          <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-lg">
            <div className="border-b border-slate-700 p-6">
              <h2 className="text-lg font-bold text-white">Users</h2>
              <TableControls search={userSearch} onSearch={(value) => { setUserSearch(value); setUserPage(1); }} filter={userPlan} onFilter={(value) => { setUserPlan(value); setUserPage(1); }} filterLabel="Subscription plan" options={[{ value: "all", label: "All plans" }, { value: "free", label: "Free" }, { value: "plus", label: "Plus" }, { value: "pro", label: "Pro" }]} pageSize={userPageSize} onPageSize={(value) => { setUserPageSize(value); setUserPage(1); }} />
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="bg-slate-900/50 text-slate-400"><tr><th className="px-6 py-4 font-medium">User</th><th className="px-6 py-4 font-medium">Plan</th><th className="px-6 py-4 font-medium">Joined</th></tr></thead>
                <tbody className="divide-y divide-slate-700">
                  {users.data.items.map((user) => <tr key={user.id} className="transition-colors hover:bg-slate-700/50"><td className="px-6 py-4 font-mono text-xs text-slate-400">{user.email || `${user.id.substring(0, 12)}...`}</td><td className="px-6 py-4"><span className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-wider ${user.subscription_tier !== "free" ? "border border-amber-500/30 bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-300"}`}>{user.subscription_tier || "free"}</span></td><td className="px-6 py-4 text-slate-300">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</td></tr>)}
                  {!users.data.items.length && <EmptyRow colSpan={3} loading={users.loading} error={users.error} />}
                </tbody>
              </table>
            </div>
            <Pagination page={userPage} totalPages={users.data.total_pages} total={users.data.total} loading={users.loading} onPage={setUserPage} />
          </section>
        </div>

        <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-lg">
          <div className="border-b border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white">Landing Page Scans (Anonymous)</h2>
            <p className="text-sm text-slate-400">Scans initiated directly from the homepage by unauthenticated visitors.</p>
            <TableControls search={anonymousSearch} onSearch={(value) => { setAnonymousSearch(value); setAnonymousPage(1); }} filter={anonymousStatus} onFilter={(value) => { setAnonymousStatus(value); setAnonymousPage(1); }} filterLabel="Scan status" options={statusOptions} pageSize={anonymousPageSize} onPageSize={(value) => { setAnonymousPageSize(value); setAnonymousPage(1); }} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400"><tr><th className="px-6 py-4 font-medium">URL</th><th className="px-6 py-4 font-medium">Location</th><th className="px-6 py-4 font-medium">IP/Device</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Score</th><th className="px-6 py-4 font-medium">Date Run</th></tr></thead>
              <tbody className="divide-y divide-slate-700">
                {anonymous.data.items.map((scan) => <tr key={scan.id} className="transition-colors hover:bg-slate-700/50"><td className="max-w-[240px] truncate px-6 py-4 font-medium text-amber-400" title={scan.url}>{scan.url}</td><td className="px-6 py-4 text-xs"><div className="font-medium text-white">{scan.city || "Unknown City"}</div><div className="text-[10px] text-slate-500">{scan.country || "Unknown Country"}</div></td><td className="px-6 py-4"><div className="font-mono text-[10px] text-emerald-500/70">{scan.ip || "—"}</div><div className="max-w-[140px] truncate text-[9px] text-slate-500" title={scan.ua}>{scan.ua || "unknown device"}</div></td><td className="px-6 py-4">{statusBadge(scan.status)}</td><td className="px-6 py-4 font-mono text-white">{scan.aeo_score ?? "N/A"}</td><td className="px-6 py-4 text-[11px] text-slate-300">{formatDateRun(scan.created_at)}</td></tr>)}
                {!anonymous.data.items.length && <EmptyRow colSpan={6} loading={anonymous.loading} error={anonymous.error} />}
              </tbody>
            </table>
          </div>
          <Pagination page={anonymousPage} totalPages={anonymous.data.total_pages} total={anonymous.data.total} loading={anonymous.loading} onPage={setAnonymousPage} />
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, colorClasses }: { label: string; value?: number; icon: ReactNode; colorClasses: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full border ${colorClasses}`}>{icon}</div>
      <div><p className="text-sm font-medium text-slate-400">{label}</p><p className="text-3xl font-bold text-white">{Number(value || 0).toLocaleString()}</p></div>
    </div>
  );
}
