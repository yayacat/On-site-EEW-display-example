"use client";

import EstimateCard from "@/components/EstimateCard";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentEstimate, setCurrentEstimate] = useState("0"); // Start with the first estimate

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
    const estimateSequence = ['0', '1', '2', '3', '4', '5-', '5+', '6-', '6+', '7'];
    let currentIndex = estimateSequence.indexOf(currentEstimate);

    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % estimateSequence.length;
      setCurrentEstimate(estimateSequence[currentIndex]);
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [currentEstimate]); // Re-run effect if currentEstimate changes to find correct index



  return (
    <main>
      <EstimateCard
        dateTime={currentTime}
        title="現地預估"
        estimate={currentEstimate}
      />
      <DarkModeToggle />
    </main>
  );
}

