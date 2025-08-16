
"use client";

import { useState, useEffect, createRef, RefObject, useCallback } from "react";
import type { Pool, Disk, PoolStatus, Settings } from "@/lib/types";
import { getPool, deletePool } from "@/services/pool-service";
import { getSettings } from "@/services/settings-service";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AlertTriangle, Layers, ShieldCheck, Siren, Database, Trash2 } from "lucide-react";
import { PoolTopology } from "./pool-topology";
import { DiskInfo } from "./disk-info";
import { LogViewer } from "./log-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { detectErrorAnomaly } from "@/ai/flows/error-anomaly-detection";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

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

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}


export function PoolDetails({ poolId }: { poolId: string }) {
  console.log("PoolDetails component rendered.");
  const [pool, setPool] = useState<Pool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorAnalysis, setErrorAnalysis] = useState(pool?.errorAnalysis);
  const [isAnalyzingErrors, setIsAnalyzingErrors] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  const handleDeletePool = async () => {
    if (!pool) return;

    if (confirm('Are you sure you want to delete this pool? This action cannot be undone.')) {
      try {
        await deletePool(pool.id.toString());
        toast({
          title: "Pool Deleted",
          description: `Successfully deleted the ${pool.name} pool`,
        });
        router.push('/'); // Redirect to the main page after deletion
      } catch (error) {
        toast({
          title: "Error Deleting Pool",
          description: "An unexpected error occurred while deleting the pool.",
          variant: "destructive",
        });
      }
    }
  };

  const allDisks = pool?.vdevs.flatMap(vdev => vdev.disks) || [];
  const diskRefs = allDisks.reduce((acc, disk) => {
    acc[disk.id] = createRef<HTMLDivElement>();
    return acc;
  }, {} as Record<string, RefObject<HTMLDivElement>>);

  const fetchPoolAndSettings = useCallback(async () => {
    setIsLoading(true);
    console.log("fetchPoolAndSettings: Starting fetch.");
    try {
        const [foundPool, foundSettings] = await Promise.all([
            getPool(poolId),
            getSettings()
        ]);
        setPool(foundPool);
        setSettings(foundSettings);
        if (foundPool) {
          setErrorAnalysis(foundPool.errorAnalysis);
        }
        console.log("fetchPoolAndSettings: Data fetched successfully.", foundPool, foundSettings);
    } catch(error) {
        console.error("fetchPoolAndSettings: Error during fetch.", error);
        toast({
            title: "Error",
            description: "Failed to fetch pool details.",
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
        console.log("fetchPoolAndSettings: Finished loading.");
    }
  }, [poolId, toast]);

  useEffect(() => {
    console.log("PoolDetails useEffect: Calling fetchPoolAndSettings.");
    console.log("Inside useEffect. Current poolId:", poolId);
    fetchPoolAndSettings();
  }, [fetchPoolAndSettings]);

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
    setErrorAnalysis(undefined); // Clear previous analysis
    try {
      const result = await detectErrorAnomaly({
        logs: pool.logs.join('\n'),
        // Using a simple baseline for demonstration
        baseline: 'No errors reported in the last 24 hours.',
      });
      setErrorAnalysis(result);
      // Here you would also save the analysis to Firestore
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

  const storageUsagePercentage = pool ? (pool.allocated / pool.size) * 100 : 0;

  console.log("PoolDetails: isLoading=", isLoading, "pool=", pool);

  if (isLoading) {
    console.log("PoolDetails: Rendering loading state.");
    return (
       <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pool) {
    console.log("PoolDetails: Rendering pool not found state.");
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

  console.log("PoolDetails: Rendering main content.");
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
        <CardContent className="pt-6 space-y-6">
            <PoolTopology vdevs={pool.vdevs} onDiskClick={scrollToDisk} />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold font-headline">Storage Overview</h3>
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span>{formatBytes(pool.allocated)} Used</span>
                                <span>{formatBytes(pool.size)} Total</span>
                            </div>
                            <Progress value={storageUsagePercentage} className="w-full h-3" />
                        </div>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 text-center pt-4">
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Usage</p>
                                <p className="text-2xl font-bold">{storageUsagePercentage.toFixed(1)}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Free</p>
                                <p className="text-2xl font-bold">{formatBytes(pool.free)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Total Capacity</p>
                                <p className="text-2xl font-bold">{formatBytes(pool.size)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAnalyzeErrors} disabled={isAnalyzingErrors || !pool.logs || pool.logs.length === 0 || !settings || !settings.googleAiApiKey}>
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

      <div className="flex justify-end mt-4">
        <Button variant="destructive" onClick={handleDeletePool}>
          <Trash2 className="h-5 w-5" />
          Delete Pool
        </Button>
      </div>
    </div>
  );
}

