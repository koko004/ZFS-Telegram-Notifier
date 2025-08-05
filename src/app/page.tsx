"use client";

import { useState, useEffect } from "react";
import type { Pool } from "@/lib/types";
import { mockPools } from "@/lib/mock-data";
import { PoolList } from "@/components/dashboard/pool-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setPools(mockPools);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>ZFS Pools Overview</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-2">
          <PoolList
            pools={pools}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
