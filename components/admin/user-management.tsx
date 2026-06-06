"use client"

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle, Clock, Wallet, Shield, Trash2, Key, Ban, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner";

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/users/list");
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data.users) ? data.users : []);
        } else {
          console.error("Failed to fetch users");
          toast.error("Failed to load users");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Error loading users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAction = async (userId: string, action: string) => {
    try {
      const res = await fetch("/api/admin/users/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Action completed");
        const response = await fetch("/api/admin/users/list");
        if (response.ok) {
          const listData = await response.json();
          setUsers(Array.isArray(listData.users) ? listData.users : []);
        }
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.user_id || "").toLowerCase().includes(searchTerm.toLowerCase());

    let statusMatch = filterStatus === "all";
    if (filterStatus === "approved") {
      statusMatch = (u.kyc_status || "").toLowerCase() === "verified";
    } else if (filterStatus === "admin") {
      statusMatch = (u.role || "").toLowerCase() === "admin";
    } else if (filterStatus !== "all") {
      statusMatch = (u.kyc_status || "").toLowerCase() === filterStatus.toLowerCase();
    }

    return matchesSearch && statusMatch;
  });

  const kycDisplay = (status: string) => {
    switch (status) {
      case "verified": return { label: "Verified", color: "bg-green-500/20 text-green-400", icon: CheckCircle };
      case "pending": return { label: "Pending", color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
      case "rejected": return { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: XCircle };
      case "suspended": return { label: "Suspended", color: "bg-red-500/20 text-red-400", icon: Ban };
      default: return { label: (status || "PENDING").toUpperCase(), color: "bg-yellow-500/20 text-yellow-400", icon: Clock };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search & Filters */}
      <Card className="border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 bg-background border-border text-sm"
            />
          </div>
        </div>
        
        {/* Filter pills - horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {["all", "approved", "pending", "rejected", "admin"].map((status) => {
            const displayName = status === "approved" ? "Verified" : status === "admin" ? "Admins" : status.charAt(0).toUpperCase() + status.slice(1);
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Mobile: Card list */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading users...</div>
        ) : filteredUsers.length ? (
          filteredUsers.map((u) => {
            const kyc = kycDisplay(u.kyc_status);
            const KycIcon = kyc.icon;
            const isExpanded = expandedUser === u.user_id;
            return (
              <Card key={u.user_id} className="border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate">{u.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email || "-"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{u.user_id?.slice(0, 12)}...</p>
                  </div>
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : u.user_id)}
                    className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Quick info row */}
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <span className={`px-2 py-0.5 rounded font-medium ${kyc.color}`}>
                    <KycIcon className="w-3 h-3 inline mr-1 -mt-0.5" />
                    {kyc.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    u.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {(u.role || "user").toUpperCase()}
                  </span>
                  <span className="text-foreground font-mono ml-auto">
                    ${(u.balance || 0).toLocaleString()}
                  </span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Joined:</span>
                        <p className="text-foreground font-medium">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profit Balance:</span>
                        <p className="text-foreground font-mono font-medium">${(u.profit_balance || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleAction(u.user_id, u.kyc_status === "suspended" ? "unsuspend" : "suspend")}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {u.kyc_status === "suspended" ? "Unsuspend" : "Suspend"}
                      </button>
                      <button
                        onClick={() => handleAction(u.user_id, "reset_password")}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Reset Pwd
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this user and all their data? This cannot be undone.")) {
                            handleAction(u.user_id, "delete");
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">No users found.</div>
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">User</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Email / Phone</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Role</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Balance</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">KYC</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Join Date</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 px-4 text-muted-foreground" colSpan={7}>Loading users...</td>
                </tr>
              ) : filteredUsers.length ? (
                filteredUsers.map((u) => (
                  <tr key={u.user_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-foreground">{u.full_name || "Unnamed"}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{u.user_id.slice(0, 12)}...</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground">{u.email || "-"}</p>
                      {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {(u.role || "user").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-foreground font-mono">${(u.balance || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">P: ${(u.profit_balance || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.kyc_status === "verified"
                          ? "bg-green-500/20 text-green-400"
                          : u.kyc_status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {(u.kyc_status || "PENDING").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-foreground whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAction(u.user_id, u.kyc_status === "suspended" ? "unsuspend" : "suspend")}
                          className="p-1.5 rounded hover:bg-yellow-500/10 text-yellow-500 transition-colors"
                          title={u.kyc_status === "suspended" ? "Unsuspend" : "Suspend"}
                        >
                          <Ban size={14} />
                        </button>
                        <button
                          onClick={() => handleAction(u.user_id, "reset_password")}
                          className="p-1.5 rounded hover:bg-blue-500/10 text-blue-500 transition-colors"
                          title="Reset Password"
                        >
                          <Key size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this user and all their data? This cannot be undone.")) {
                              handleAction(u.user_id, "delete");
                            }
                          }}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6 px-4 text-muted-foreground" colSpan={7}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}