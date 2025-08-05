
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers3, Settings, Home } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { PoolList } from "@/components/dashboard/pool-list";
import { AddPoolDialog } from "@/components/dashboard/add-pool-dialog";
import type { Pool } from "@/lib/types";
import { mockPools } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export function Sidebar() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setPools(mockPools);
    setIsLoading(false);
  }, []);

  return (
    <aside className="hidden w-80 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
          <Layers3 className="h-6 w-6 text-primary" />
          <span>ZFS Notifier</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
            <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <Home className="h-4 w-4" />
                Dashboard
            </Link>
             <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <Settings className="h-4 w-4" />
                Settings
            </Link>
        </nav>
        <Separator className="my-4" />
        <Card className="mx-4 shadow-none border-0 bg-transparent">
            <CardHeader className="px-4 pt-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">ZFS Pools</CardTitle>
                    <AddPoolDialog />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <PoolList pools={pools} isLoading={isLoading} />
            </CardContent>
        </Card>
      </div>
      <div className="mt-auto flex flex-col items-center gap-4 p-4">
         <ThemeToggle />
      </div>
    </aside>
  );
}
