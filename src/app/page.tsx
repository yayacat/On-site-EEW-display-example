"use client";

import EstimateCard from "@/components/EstimateCard";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';

import { useEarthquakeData } from '@/hooks/useEarthquakeData';

function PageContent() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentEstimate, setCurrentEstimate] = useState("--"); // Start with the first estimate
  const searchParams = useSearchParams();

  const searchCity = searchParams.get('city') || '臺南市';
  const searchTown = searchParams.get('town') || '歸仁區';
  const isDevMode = searchParams.get('dev')?.startsWith('true');

  const { maxIntensity: earthquakeMax } = useEarthquakeData({ city: searchCity, town: searchTown, isDevMode });


  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).replace(/\//g, "/")
      );
    };
    updateCurrentTime(); // Set initial time immediately
    const intervalId = setInterval(updateCurrentTime, 1000); // Update every second
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (isDevMode) {
      if (earthquakeMax != null) {
        setCurrentEstimate(earthquakeMax.toString());
      }
      // const estimateSequence = ['--', '0', '1', '2', '3', '4', '5-', '5+', '6-', '6+', '7'];
      // let currentIndex = estimateSequence.indexOf(currentEstimate);

      // const intervalId = setInterval(() => {
      //   currentIndex = (currentIndex + 1) % estimateSequence.length;
      //   setCurrentEstimate(estimateSequence[currentIndex]);
      // }, 1000); // Update every second
      // return () => clearInterval(intervalId); // Cleanup on unmount
    } else {
      setCurrentEstimate("--"); // Set default value if not in dev mode
      if (earthquakeMax != null) {
        setCurrentEstimate(earthquakeMax.toString());
      }
    }
  }, [searchParams, currentEstimate, earthquakeMax, isDevMode]); // Re-run effect if searchParams, currentEstimate changes

  return (
    <main className="mt-8">
      <EstimateCard
        dateTime={currentTime}
        title={searchParams.get('dev')?.startsWith('true') ? '現地預估測試' : '現地預估'}
        estimate={currentEstimate}
      />
      <DarkModeToggle />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}

