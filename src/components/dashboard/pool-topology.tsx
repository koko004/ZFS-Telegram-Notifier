
"use client";

import type { VDev } from "@/lib/types";
import { HardDrive, Copy, Layers2, AlignHorizontalSpaceAround, MemoryStick } from "lucide-react";
import { StatusIcon } from "./status-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const topologyIcons: { [key in VDev["type"]]: React.ReactNode } = {
  stripe: <AlignHorizontalSpaceAround className="h-5 w-5" />,
  mirror: <Copy className="h-5 w-5" />,
  raidz1: <Layers2 className="h-5 w-5" />,
  raidz2: <Layers2 className="h-5 w-5" />,
  raidz3: <Layers2 className="h-5 w-5" />,
};

const topologyDescriptions: { [key in VDev["type"]]: string } = {
    stripe: "Stripe (RAID-0): Combines multiple disks into a single volume. High performance, but no redundancy. One disk failure will result in total data loss.",
    mirror: "Mirror (RAID-1): Duplicates data across two or more disks. Provides excellent redundancy, as the pool can tolerate failures of all but one disk.",
    raidz1: "RAID-Z1: Similar to RAID-5, it stripes data across disks with single parity. It can tolerate the failure of one disk without data loss.",
    raidz2: "RAID-Z2: Similar to RAID-6, it uses double parity. It can tolerate the failure of up to two disks without data loss, offering more redundancy than RAID-Z1.",
    raidz3: "RAID-Z3: Uses triple parity for even greater redundancy. It can tolerate the failure of up to three disks, suitable for very large arrays.",
};

const DiskIcon = ({ name }: { name: string }) => {
  if (name.toLowerCase().includes('nvme')) {
    return <MemoryStick className="h-5 w-5 text-muted-foreground" />;
  }
  return <HardDrive className="h-5 w-5 text-muted-foreground" />;
};

interface PoolTopologyProps {
    vdevs: VDev[];
    onDiskClick: (diskId: string) => void;
}

export function PoolTopology({ vdevs, onDiskClick }: PoolTopologyProps) {
  return (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold font-headline">Pool Topology</h3>
        <div className="space-y-3 rounded-lg border p-4">
            {vdevs.map((vdev, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 w-full sm:w-36 shrink-0 bg-muted p-2 rounded-md justify-start">
                            {topologyIcons[vdev.type]}
                            <span className="font-medium capitalize">{vdev.type}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-auto max-w-xs">
                        <p>{topologyDescriptions[vdev.type]}</p>
                    </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-3 items-center">
                <TooltipProvider>
                {vdev.disks.map((disk) => (
                    <Tooltip key={disk.id}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => onDiskClick(disk.id)}
                            className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted transition-colors cursor-pointer"
                        >
                            <DiskIcon name={disk.name} />
                            <span className="text-sm font-medium">{disk.name}</span>
                            <StatusIcon status={disk.status} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="capitalize">Status: {disk.status}</p>
                        <p>Read Errors: {disk.errors.read}</p>
                        <p>Write Errors: {disk.errors.write}</p>
                        <p>Checksum Errors: {disk.errors.checksum}</p>
                    </TooltipContent>
                    </Tooltip>
                ))}
                </TooltipProvider>
                </div>
            </div>
            ))}
        </div>
    </div>
  );
}
