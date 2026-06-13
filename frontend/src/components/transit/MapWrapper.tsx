"use client";

import dynamic from "next/dynamic";
import type { Station } from "@/lib/intelligence";

const GlobalMap = dynamic(
  () => import("@/components/transit/GlobalMap").then((mod) => mod.GlobalMap),
  { ssr: false }
);

interface Props {
  onStationSelect?: (station: Station) => void;
}

export function MapWrapper({ onStationSelect }: Props) {
  return <GlobalMap onStationSelect={onStationSelect} />;
}
