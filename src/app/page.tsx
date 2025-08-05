
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Pool, PoolStatus, DiskStatus } from "@/lib/types";
import { mockPools } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HardDrive, Server, AlertTriangle, Send, MemoryStick, ShieldCheck, ShieldAlert, ShieldX, Thermometer } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from 'recharts';
import { cn } from "@/lib/utils";

export default function Home() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState("Connected");

  useEffect(() => {
    // Simulate fetching data
    setPools(mockPools);
    setIsLoading(false);
  }, []);

  const { 
    totalDisks, 
    failedDisks, 
    diskTypes,
    poolStatusCounts,
    failedDiskStatus,
    diskTemperatures
  } = useMemo(() => {
    if (isLoading || pools.length === 0) {
      return { 
        totalDisks: 0, 
        failedDisks: 0, 
        diskTypes: { nvme: 0, hdd: 0 },
        poolStatusCounts: { online: 0, degraded: 0, faulted: 0 },
        failedDiskStatus: { degraded: 0, faulted: 0, offline: 0, unavailable: 0 },
        diskTemperatures: []
      };
    }

    const allDisks = pools.flatMap(p => p.vdevs.flatMap(v => v.disks));
    const failedDisksList = allDisks.filter(d => d.status !== 'online');
    
    const diskTypes = allDisks.reduce((acc, disk) => {
        if (disk.name.toLowerCase().includes('nvme')) {
            acc.nvme++;
        } else {
            acc.hdd++;
        }
        return acc;
    }, { nvme: 0, hdd: 0});

    const poolStatusCounts = pools.reduce((acc, pool) => {
        acc[pool.status] = (acc[pool.status] || 0) + 1;
        return acc;
    }, {} as Record<PoolStatus, number>);

    const failedDiskStatus = failedDisksList.reduce((acc, disk) => {
        acc[disk.status] = (acc[disk.status] || 0) + 1;
        return acc;
    }, {} as Record<Exclude<DiskStatus, 'online'>, number>);

    const diskTemperatures = allDisks
        .filter(d => d.temperature !== undefined)
        .map(d => {
            const temp = d.temperature as number;
            let fill = "hsl(var(--chart-1))"; // Normal
            if (temp >= 50 && temp < 60) {
                fill = "hsl(var(--chart-4))"; // Warning
            } else if (temp >= 60) {
                fill = "hsl(var(--destructive))"; // Danger
            }
            return { name: d.name, temperature: temp, fill };
        });


    return { 
        totalDisks: allDisks.length, 
        failedDisks: failedDisksList.length, 
        diskTypes,
        poolStatusCounts,
        failedDiskStatus,
        diskTemperatures
    };
  }, [pools, isLoading]);

  const diskTypeData = useMemo(() => {
    if (!diskTypes) return [];
    return [
      { name: 'NVMe', value: diskTypes.nvme, fill: 'var(--color-nvme)' },
      { name: 'HDD', value: diskTypes.hdd, fill: 'var(--color-hdd)' },
    ];
  }, [diskTypes]);

  const chartConfig = {
    nvme: {
      label: 'NVMe',
      color: 'hsl(var(--chart-1))',
    },
    hdd: {
      label: 'HDD',
      color: 'hsl(var(--chart-2))',
    },
    temperature: {
        label: 'Temperature (°C)',
        color: 'hsl(var(--chart-1))',
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, borderColor, children }: { title: string, value: string | number, icon: React.ElementType, color?: string, borderColor?: string, children?: React.ReactNode }) => (
    <Card className={cn("border-l-4", borderColor)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", color || "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {children}
      </CardContent>
    </Card>
  );
  
  const DetailRow = ({ icon: Icon, label, value, colorClass }: { icon: React.ElementType, label: string, value: number, colorClass?: string }) => {
    if (value === 0 || value === undefined) return null;
    return (
        <div className="flex items-center gap-1">
            <Icon className={cn("h-3 w-3", colorClass)} />
            <span className="capitalize">{label}: {value}</span>
        </div>
    );
  };


  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pools" value={pools.length} icon={Server} color="text-primary" borderColor="border-primary">
            <div className="text-xs text-muted-foreground flex items-center justify-between mt-1 pt-1 border-t">
                <DetailRow icon={ShieldCheck} label="Online" value={poolStatusCounts.online} colorClass="text-primary"/>
                <DetailRow icon={ShieldAlert} label="Degraded" value={poolStatusCounts.degraded} colorClass="text-yellow-500"/>
                <DetailRow icon={ShieldX} label="Faulted" value={poolStatusCounts.faulted} colorClass="text-destructive"/>
            </div>
        </StatCard>
        
        <StatCard title="Total Disks" value={totalDisks} icon={HardDrive} color="text-accent" borderColor="border-accent">
            <div className="text-xs text-muted-foreground flex items-center justify-between mt-1 pt-1 border-t">
               <div className="flex items-center gap-1">
                   <MemoryStick className="h-3 w-3" />
                   <span>NVMe: {diskTypes.nvme}</span>
               </div>
               <div className="flex items-center gap-1">
                   <HardDrive className="h-3 w-3" />
                   <span>HDD: {diskTypes.hdd}</span>
               </div>
            </div>
        </StatCard>
        
        <StatCard title="Failed Disks" value={failedDisks} icon={AlertTriangle} color={failedDisks > 0 ? "text-destructive" : "text-muted-foreground"} borderColor={failedDisks > 0 ? "border-destructive" : "border-border"}>
             <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-between mt-1 pt-1 border-t">
                <DetailRow icon={ShieldAlert} label="Degraded" value={failedDiskStatus.degraded} colorClass="text-yellow-500"/>
                <DetailRow icon={ShieldX} label="Faulted" value={failedDiskStatus.faulted} colorClass="text-destructive"/>
                 <DetailRow icon={ShieldX} label="Offline" value={failedDiskStatus.offline} />
             </div>
        </StatCard>
        <StatCard title="Telegram Bot" value={telegramStatus} icon={Send} color="text-blue-500" borderColor="border-blue-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Disk Types</CardTitle>
            <CardDescription>Distribution of disk types across all pools.</CardDescription>
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
                        data={diskTypeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                        >
                        <Cell key="nvme" fill="hsl(var(--chart-1))" />
                        <Cell key="hdd" fill="hsl(var(--chart-2))" />
                        </Pie>
                    </PieChart>
                    </ChartContainer>
                </div>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-1))] mr-2" />
                        NVMe: {diskTypes.nvme}
                    </div>
                    <div className="flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-2))] mr-2" />
                        HDD: {diskTypes.hdd}
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Thermometer className="text-primary"/>
                    Disk Temperatures
                </CardTitle>
                <CardDescription>Current temperatures of all disks.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-[250px] w-full">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart layout="vertical" data={diskTemperatures} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                width={80}
                            />
                            <XAxis dataKey="temperature" type="number" unit="°C" />
                            <ChartTooltip 
                                cursor={false}
                                content={<ChartTooltipContent 
                                    indicator="dot"
                                />} 
                            />
                            <Bar dataKey="temperature" radius={4}>
                                {diskTemperatures.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
