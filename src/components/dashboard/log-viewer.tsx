"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookText } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface LogViewerProps {
  logs: string[];
  isLoading: boolean;
}

export function LogViewer({ logs, isLoading }: LogViewerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookText className="text-primary" />
            Pool Logs
          </CardTitle>
          <CardDescription>Recent events from the ZFS pool.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-full" />
            </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookText className="text-primary" />
          Pool Logs
        </CardTitle>
        <CardDescription>Recent events from the ZFS pool.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full rounded-md border bg-muted/30 p-4">
          <pre className="text-xs whitespace-pre-wrap font-code">
            {logs.length > 0 ? logs.join("\n") : "No logs available."}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
