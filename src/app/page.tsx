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

  // Get city and town from localStorage, fallback to searchParams, then default
  const storedCity = typeof window !== 'undefined' ? localStorage.getItem('city') : null;
  const storedTown = typeof window !== 'undefined' ? localStorage.getItem('town') : null;

  const searchCity = searchParams.get('city') || storedCity || '臺南市'; // Use searchParams, then stored, then default

  // Get town, clean up if it contains extra parameters, then fallback to stored, then default
  let searchTown = searchParams.get('town');
  if (searchTown && searchTown.includes('?')) {
    searchTown = searchTown.split('?')[0];
  }
  searchTown = searchTown || storedTown || '歸仁區'; // Use cleaned searchParams, then stored, then default


  const isDevMode = searchParams.get('dev')?.startsWith('true');

  const { maxIntensity: earthquakeMax } = useEarthquakeData({ city: searchCity, town: searchTown, isDevMode });

  // Save city and town to localStorage whenever they are determined
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (searchCity) {
        localStorage.setItem('city', searchCity);
      }
      if (searchTown) {
        localStorage.setItem('town', searchTown);
      }
    }
  }, [searchCity, searchTown]); // Depend on searchCity and searchTown

  // Effect for updating current time
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

  // Effect for handling earthquake data and updating estimate
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

