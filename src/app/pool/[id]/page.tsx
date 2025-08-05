"use client";

import { PoolDetails } from "@/components/dashboard/pool-details";

export default function PoolDetailsPage({ params }: { params: { id: string } }) {
  return <PoolDetails poolId={params.id} />;
}
