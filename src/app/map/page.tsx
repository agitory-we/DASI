import React from 'react';
import MapContent from '@/components/map/MapContent';

export const dynamic = 'force-dynamic';

interface MapPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function MapPage({ searchParams }: MapPageProps) {
  const spotId = typeof searchParams?.spotId === 'string' ? searchParams.spotId : undefined;
  return <MapContent defaultSpotId={spotId} />;
}
