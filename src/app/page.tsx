"use client";

import EstimateCard from "@/components/EstimateCard";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentEstimate, setCurrentEstimate] = useState("--"); // Start with the first estimate
  const searchParams = useSearchParams();

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
    const isDevMode = searchParams.get('dev')?.startsWith('true');

    if (isDevMode) {
      const estimateSequence = ['--', '0', '1', '2', '3', '4', '5-', '5+', '6-', '6+', '7'];
      let currentIndex = estimateSequence.indexOf(currentEstimate);

      const intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % estimateSequence.length;
        setCurrentEstimate(estimateSequence[currentIndex]);
      }, 1000); // Update every second
      return () => clearInterval(intervalId); // Cleanup on unmount
    } else {
      setCurrentEstimate("--"); // Set default value if not in dev mode
    }
  }, [searchParams, currentEstimate]); // Re-run effect if searchParams or currentEstimate changes



  return (
    <main>
      <EstimateCard
        dateTime={currentTime}
        title={searchParams.get('dev')?.startsWith('true') ? '現地預估測試' : '現地預估'}
        estimate={currentEstimate}
      />
      <DarkModeToggle />
    </main>
  );
}

