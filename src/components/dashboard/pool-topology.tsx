"use client";

import type { VDev } from "@/lib/types";
import { HardDrive, Copy, Layers2, AlignHorizontalSpaceAround } from "lucide-react";
import { StatusIcon } from "./status-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const topologyIcons: { [key in VDev["type"]]: React.ReactNode } = {
  stripe: <AlignHorizontalSpaceAround className="h-5 w-5" />,
  mirror: <Copy className="h-5 w-5" />,
  raidz1: <Layers2 className="h-5 w-5" />,
  raidz2: <Layers2 className="h-5 w-5" />,
  raidz3: <Layers2 className="h-5 w-5" />,
};

export function PoolTopology({ vdevs }: { vdevs: VDev[] }) {
  return (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold font-headline">Pool Topology</h3>
        <TooltipProvider>
            <div className="space-y-3 rounded-lg border p-4">
                {vdevs.map((vdev, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-32 shrink-0 bg-muted p-2 rounded-md">
                        {topologyIcons[vdev.type]}
                        <span className="font-medium capitalize">{vdev.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                    {vdev.disks.map((disk) => (
                        <Tooltip key={disk.id}>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted transition-colors cursor-pointer">
                            <HardDrive className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">{disk.name}</span>
                            <StatusIcon status={disk.status} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="capitalize">Status: {disk.status}</p>
                            <p>Read Errors: {disk.errors.read}</p>
                            <p>Write Errors: {disk.errors.write}</p>
                            <p>Checksum Errors: {disk.errors.checksum}</p>
                        </TooltipContent>
                        </Tooltip>
                    ))}
                    </div>
                </div>
                ))}
            </div>
        </TooltipProvider>
    </div>
  );
}
