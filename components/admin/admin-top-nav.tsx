"use client"

import { Bell, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminTopNav({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <div className="border-b border-border bg-card px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">Administration</h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">Platform management and monitoring</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <Button variant="ghost" size="icon" className="w-9 h-9 sm:w-10 sm:h-10">
          <Bell className="w-4 h-5 sm:w-5 sm:h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-9 h-9 sm:w-10 sm:h-10">
          <Settings className="w-4 h-5 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  )
}