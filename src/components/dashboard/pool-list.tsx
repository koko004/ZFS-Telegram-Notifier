"use client";

import type { Pool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import { StatusIcon } from "./status-icon";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";


interface PoolListProps {
  pools: Pool[];
  isLoading: boolean;
}

export function PoolList({ pools, isLoading }: PoolListProps) {
  const params = useParams();
  const selectedPoolId = params.id;

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
              selectedPoolId === pool.id && "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground"
            )}
            asChild
          >
            <Link href={`/pool/${pool.id}`}>
              <StatusIcon status={pool.status} />
              <Layers className="h-5 w-5" />
              <span className="truncate">{pool.name}</span>
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}
