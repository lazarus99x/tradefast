"use client"

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { toast } from "sonner";

export function PlatformAnalytics() {
  const [volumeData, setVolumeData] = useState([
    { date: "Mon", volume: 0 },
    { date: "Tue", volume: 0 },
    { date: "Wed", volume: 0 },
    { date: "Thu", volume: 0 },
    { date: "Fri", volume: 0 },
    { date: "Sat", volume: 0 },
    { date: "Sun", volume: 0 },
  ]);
  const [userGrowthData, setUserGrowthData] = useState([
    { month: "Jan", users: 0 },
    { month: "Feb", users: 0 },
    { month: "Mar", users: 0 },
    { month: "Apr", users: 0 },
    { month: "May", users: 0 },
    { month: "Jun", users: 0 },
  ]);
  const [metrics, setMetrics] = useState({
    totalTrades: 0,
    avgTradeSize: 0,
    activeTraders: 0,
    platformRevenue: 0,
    volumeChange: 0,
    tradesChange: 0,
    tradersChange: 0,
    revenueChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/analytics");
        if (response.ok) {
          const data = await response.json();
          if (data.weeklyVolume) setVolumeData(data.weeklyVolume);
          if (data.userGrowth) setUserGrowthData(data.userGrowth);
          if (data.metrics) setMetrics(data.metrics);
        } else {
          console.error("Failed to load analytics");
          toast.error("Failed to load analytics data");
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
        toast.error("Error loading analytics");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card className="border-border bg-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Weekly Trading Volume</h3>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="volume" stroke="#00FE01" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border bg-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">User Growth</h3>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userGrowthData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="users" fill="#00FE01" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border bg-card p-4 sm:p-6 lg:col-span-2">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Platform Metrics</h3>
        {loading ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Loading metrics...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{metrics.totalTrades.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${metrics.tradesChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {metrics.tradesChange >= 0 ? "+" : ""}{metrics.tradesChange}% this week
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Avg Trade Size</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">${metrics.avgTradeSize.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Average per trade</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Active Traders</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{metrics.activeTraders.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${metrics.tradersChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {metrics.tradersChange >= 0 ? "+" : ""}{metrics.tradersChange}% this week
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Platform Fee Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">${metrics.platformRevenue.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${metrics.revenueChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {metrics.revenueChange >= 0 ? "+" : ""}{metrics.revenueChange}% this week
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}