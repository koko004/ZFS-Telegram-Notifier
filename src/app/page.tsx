"use client";

import { useState, useEffect } from "react";
import type { Pool } from "@/lib/types";
import { mockPools } from "@/lib/mock-data";
import { Header } from "@/components/header";
import { PoolList } from "@/components/dashboard/pool-list";
import { PoolDetails } from "@/components/dashboard/pool-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setPools(mockPools);
    setSelectedPool(mockPools[0] || null);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:flex-row">
        <Card className="w-full lg:w-80 lg:h-fit shrink-0">
          <CardHeader>
            <CardTitle>ZFS Pools</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-2">
            <PoolList
              pools={pools}
              selectedPool={selectedPool}
              onSelectPool={setSelectedPool}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        <div className="flex-1">
          <PoolDetails pool={selectedPool} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
