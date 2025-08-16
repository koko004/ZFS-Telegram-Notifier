"use client";

import { useEffect, useState } from 'react';
import { PoolDetails } from '@/components/dashboard/pool-details';
import { useParams } from "next/navigation";
import ErrorBoundary from "@/components/error-boundary";

export default function PoolDetailsPage() {
  const params = useParams();
  const poolId = params.id as string;
  
  if (!poolId) {
    // Optionally, render a loading state or handle the case where id is not available yet
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <PoolDetails poolId={poolId} />
    </ErrorBoundary>
  );
}
