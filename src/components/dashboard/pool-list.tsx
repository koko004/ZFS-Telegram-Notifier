"use client";

import type { Pool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import { StatusIcon } from "./status-icon";
import { Skeleton } from "../ui/skeleton";
import { AddPoolDialog } from "./add-pool-dialog";

interface PoolListProps {
  pools: Pool[];
  selectedPool: Pool | null;
  onSelectPool: (pool: Pool) => void;
  isLoading: boolean;
}

export function PoolList({ pools, selectedPool, onSelectPool, isLoading }: PoolListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <nav className="flex flex-col gap-1">
        {pools.map((pool) => (
          <Button
            key={pool.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3",
              selectedPool?.id === pool.id && "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground"
            )}
            onClick={() => onSelectPool(pool)}
          >
            <StatusIcon status={pool.status} />
            <Layers className="h-5 w-5" />
            <span className="truncate">{pool.name}</span>
          </Button>
        ))}
      </nav>
      <div className="mt-4">
        <AddPoolDialog />
      </div>
    </div>
  );
}
