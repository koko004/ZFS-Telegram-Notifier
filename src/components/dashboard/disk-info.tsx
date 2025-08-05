
"use client";

import { useState, forwardRef } from "react";
import type { Disk } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, AlertTriangle, Cpu, MemoryStick, Database, FileText } from "lucide-react";
import { analyzeSmartData } from "@/ai/flows/smart-data-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

const statusVariantMap: { [key in Disk["status"]]: "default" | "destructive" | "secondary" | "warning" } = {
  online: "default",
  degraded: "warning",
  faulted: "destructive",
  offline: "secondary",
  unavailable: "secondary",
};

const DiskIcon = ({ name }: { name: string }) => {
  if (name.toLowerCase().includes('nvme')) {
    return <MemoryStick className="text-primary" />;
  }
  return <HardDrive className="text-primary" />;
};

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 GB';
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export const DiskInfo = forwardRef<HTMLDivElement, { disk: Disk }>(({ disk }, ref) => {
  const [analysis, setAnalysis] = useState(disk.smartAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!disk.smartData) {
      toast({
        title: "Analysis Failed",
        description: "No SMART data available for this disk.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    setAnalysis(undefined); // Clear previous analysis
    try {
      const result = await analyzeSmartData({ smartData: disk.smartData });
      setAnalysis(result.summary);
    } catch (error) {
      console.error("SMART analysis failed:", error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze SMART data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card ref={ref}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DiskIcon name={disk.name} />
          <span>{disk.name}</span>
          <Badge variant={statusVariantMap[disk.status]} className="ml-auto capitalize">{disk.status}</Badge>
        </CardTitle>
        <CardDescription>
          {disk.model}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2 font-medium">
                <Database className="h-4 w-4 text-muted-foreground" />
                Size
            </div>
            <div className="font-bold text-foreground">
                {disk.size ? formatBytes(disk.size) : "N/A"}
            </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="font-medium">Errors</div>
            <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Read: <span className="font-bold text-foreground">{disk.errors.read}</span></span>
                <span>Write: <span className="font-bold text-foreground">{disk.errors.write}</span></span>
                <span>Checksum: <span className="font-bold text-foreground">{disk.errors.checksum}</span></span>
            </div>
        </div>
        
        {analysis && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-accent" />
                SMART Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{analysis}</p>
            </CardContent>
          </Card>
        )}
         {isAnalyzing && <Skeleton className="h-24 w-full" />}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={!disk.smartData} className="w-full">
                    <FileText />
                    View SMART Data
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>SMART Data for {disk.name}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96 w-full rounded-md border bg-muted/30 p-4">
                    <pre className="text-xs whitespace-pre-wrap font-code">
                        {disk.smartData || "No SMART data available."}
                    </pre>
                </ScrollArea>
            </DialogContent>
        </Dialog>
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !disk.smartData} className="w-full">
            <Cpu />
            {isAnalyzing ? "Analyzing..." : "Analyze"}
        </Button>
      </CardFooter>
    </Card>
  );
});

DiskInfo.displayName = "DiskInfo";
