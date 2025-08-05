"use client";

import { useState, useEffect, useMemo } from "react";
import type { Pool } from "@/lib/types";
import { mockPools } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HardDrive, Server, AlertTriangle, Send } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState("Connected");

  useEffect(() => {
    // Simulate fetching data
    setPools(mockPools);
    setIsLoading(false);
  }, []);

  const { totalDisks, failedDisks, totalAllocated, totalSize } = useMemo(() => {
    if (isLoading || pools.length === 0) {
      return { totalDisks: 0, failedDisks: 0, totalAllocated: 0, totalSize: 0 };
    }

    const allDisks = pools.flatMap(p => p.vdevs.flatMap(v => v.disks));
    const failedDisks = allDisks.filter(d => d.status === 'faulted' || d.status === 'degraded' || d.status === 'offline' || d.status === 'unavailable').length;
    
    const totalAllocated = pools.reduce((acc, pool) => acc + pool.allocated, 0);
    const totalSize = pools.reduce((acc, pool) => acc + pool.size, 0);

    return { totalDisks: allDisks.length, failedDisks, totalAllocated, totalSize };
  }, [pools, isLoading]);

  const storageData = useMemo(() => {
    if (totalSize === 0) return [];
    return [
      { name: 'Used', value: totalAllocated, fill: 'var(--color-used)' },
      { name: 'Free', value: totalSize - totalAllocated, fill: 'var(--color-free)' },
    ];
  }, [totalAllocated, totalSize]);

  const chartConfig = {
    used: {
      label: 'Used',
      color: 'hsl(var(--primary))',
    },
    free: {
      label: 'Free',
      color: 'hsl(var(--secondary))',
    },
  };

  const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pools" value={pools.length} icon={Server} />
        <StatCard title="Total Disks" value={totalDisks} icon={HardDrive} />
        <StatCard title="Failed Disks" value={failedDisks} icon={AlertTriangle} />
        <StatCard title="Telegram Bot" value={telegramStatus} icon={Send} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
          <CardDescription>Total used storage across all pools.</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
            <div className="h-[250px] w-full">
               <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={storageData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                       <Cell key="used" fill="hsl(var(--chart-1))" />
                       <Cell key="free" fill="hsl(var(--chart-2))" />
                    </Pie>
                  </PieChart>
                </ChartContainer>
            </div>
             <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-1))] mr-2" />
                    Used: {(totalAllocated / 1000).toFixed(2)} TB
                </div>
                <div className="flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-2))] mr-2" />
                    Free: {((totalSize - totalAllocated) / 1000).toFixed(2)} TB
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
