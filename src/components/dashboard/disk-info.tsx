"use client";

import { useState } from "react";
import type { Disk } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, AlertTriangle, Cpu } from "lucide-react";
import { StatusIcon } from "./status-icon";
import { analyzeSmartData } from "@/ai/flows/smart-data-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

const statusVariantMap: { [key in Disk["status"]]: "default" | "destructive" | "secondary" | "outline" } = {
  online: "default",
  degraded: "outline",
  faulted: "destructive",
  offline: "secondary",
  unavailable: "secondary",
};

export function DiskInfo({ disk }: { disk: Disk }) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <HardDrive className="text-primary" />
          <span>{disk.name}</span>
          <Badge variant={statusVariantMap[disk.status]} className="ml-auto capitalize">{disk.status}</Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
            <StatusIcon status={disk.status} />
            <span>Status: {disk.status.charAt(0).toUpperCase() + disk.status.slice(1)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={isAnalyzing || !disk.smartData} className="w-full">
            <Cpu className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze SMART Data"}
        </Button>
      </CardFooter>
    </Card>
  );
}
