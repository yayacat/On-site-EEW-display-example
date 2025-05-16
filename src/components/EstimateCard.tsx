import React, { useState, useEffect } from 'react';

interface EstimateCardProps {
  dateTime: string;
  title: string;
  estimate: string;
}



const EstimateCard: React.FC<EstimateCardProps> = ({ dateTime, title, estimate }) => {
  const intensityColors: { [key: string]: string } = {
    '--': '#202020',
    '0': '#202020',
    '1': '#003264',
    '2': '#0064c8',
    '3': '#1e9632',
    '4': '#ffc800',
    '5-': '#ff9600',
    '5+': '#ff6400',
    '6-': '#ff0000',
    '6+': '#c00000',
    '7': '#9600c8',
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const estimateTextColor = intensityColors[estimate] || '#000000'; // Default text color if estimate doesn't match (e.g., black)

  const renderEstimate = () => {
    if (estimate.includes('--')) {
      return (
        <>
          <span style={{ position: 'relative', top: '-0.1em' }}>-</span>
          <span style={{ position: 'relative', top: '-0.1em' }}>-</span>
        </>
      );
    } else if (estimate.includes('-')) {
      const parts = estimate.split('-');
      return (
        <>
          <span>{parts[0]}</span>
          <span style={{ position: 'relative', top: '-0.1em' }}>-</span>
        </>
      );
    }
    return <span>{estimate}</span>;
  };

  return (
    <div className="border border-gray-300 p-6 rounded-md shadow-md max-w-sm mx-auto bg-white dark:bg-gray-700">
      <div className="text-sm text-gray-500 mb-2 text-center">{dateTime}</div>
      <div className="text-xl font-bold text-center mb-4 dark:text-white">{title}</div>
      {isClient ? (
        <div className="text-6xl font-bold text-center estimate-color flex items-center justify-center" style={{ color: estimateTextColor }}>
          {renderEstimate()}
        </div>
      ) : (
        <div className="text-6xl font-bold text-center estimate-color flex items-center justify-center">{/* Placeholder or server-friendly content */}</div>
      )}
    </div>
  );
};

export default EstimateCard;