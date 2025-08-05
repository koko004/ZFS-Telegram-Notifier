
"use client";

import { useState, useEffect, createRef, RefObject } from "react";
import type { Pool, Disk, PoolStatus } from "@/lib/types";
import { mockPools } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AlertTriangle, Layers, ShieldCheck, Siren } from "lucide-react";
import { PoolTopology } from "./pool-topology";
import { DiskInfo } from "./disk-info";
import { LogViewer } from "./log-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { detectErrorAnomaly } from "@/ai/flows/error-anomaly-detection";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const statusVariantMap: { [key in PoolStatus]: "default" | "destructive" | "warning" } = {
  online: "default",
  degraded: "warning",
  faulted: "destructive",
};

const statusDescriptions: { [key in PoolStatus]: string } = {
    online: "The pool is healthy and operating normally. All vdevs and disks are online.",
    degraded: "The pool is still operational, but one or more devices have failed. Data redundancy is compromised. The failed device should be replaced as soon as possible.",
    faulted: "The pool is offline and cannot be accessed. This is a critical error, often due to multiple disk failures beyond the redundancy level of the pool. Immediate action is required to prevent data loss.",
};


export function PoolDetails({ poolId }: { poolId: string }) {
  const [pool, setPool] = useState<Pool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorAnalysis, setErrorAnalysis] = useState(pool?.errorAnalysis);
  const [isAnalyzingErrors, setIsAnalyzingErrors] = useState(false);
  const { toast } = useToast();

  const allDisks = pool?.vdevs.flatMap(vdev => vdev.disks) || [];
  const diskRefs = allDisks.reduce((acc, disk) => {
    acc[disk.id] = createRef<HTMLDivElement>();
    return acc;
  }, {} as Record<string, RefObject<HTMLDivElement>>);

  useEffect(() => {
    // Simulate fetching a single pool's data
    const foundPool = mockPools.find(p => p.id === poolId) || null;
    setPool(foundPool);
    if (foundPool) {
      setErrorAnalysis(foundPool.errorAnalysis);
    }
    setIsLoading(false);
  }, [poolId]);

  const handleAnalyzeErrors = async () => {
    if (!pool || !pool.logs || pool.logs.length === 0) {
      toast({
        title: "Analysis Failed",
        description: "No logs available for error analysis.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzingErrors(true);
    setErrorAnalysis(undefined);
    try {
      const result = await detectErrorAnomaly({
        logs: pool.logs.join('\n'),
        // Using a simple baseline for demonstration
        baseline: 'No errors reported in the last 24 hours.',
      });
      setErrorAnalysis(result);
    } catch (error) {
      console.error("Error analysis failed:", error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze error logs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingErrors(false);
    }
  };
  
  const scrollToDisk = (diskId: string) => {
    diskRefs[diskId]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (isLoading) {
    return (
       <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pool) {
    return (
      <Card className="flex h-full items-center justify-center m-4 md:m-6">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12" />
          <p className="mt-4 text-lg">Pool not found</p>
          <p>The requested ZFS pool could not be found.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-2xl font-headline">
                <Layers className="h-8 w-8 text-primary"/>
                {pool.name}
              </CardTitle>
              <CardDescription className="mt-2">
                Overall status of the ZFS pool.
              </CardDescription>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                    <Badge variant={statusVariantMap[pool.status]} className="text-base capitalize cursor-pointer">
                        {pool.status === 'online' ? <ShieldCheck className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                        {pool.status}
                    </Badge>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="w-auto max-w-sm">
                    <p className="font-bold capitalize">{pool.status}</p>
                    <p>{statusDescriptions[pool.status]}</p>
                </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
            <PoolTopology vdevs={pool.vdevs} onDiskClick={scrollToDisk} />
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAnalyzeErrors} disabled={isAnalyzingErrors}>
            <Siren className="mr-2 h-4 w-4" />
            {isAnalyzingErrors ? 'Analyzing Errors...' : 'Detect Error Anomaly'}
          </Button>
        </CardFooter>
      </Card>

      {isAnalyzingErrors && <Skeleton className="w-full h-32" />}
      {errorAnalysis?.isAnomaly && (
        <Card className="border-accent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                    <AlertTriangle/>
                    Error Anomaly Detected
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{errorAnalysis.explanation}</p>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allDisks.map((disk) => (
          <DiskInfo key={disk.id} disk={disk} ref={diskRefs[disk.id]} />
        ))}
      </div>

      <LogViewer logs={pool.logs} isLoading={isLoading} />
    </div>
  );
}
