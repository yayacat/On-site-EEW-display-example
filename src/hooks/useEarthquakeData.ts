import { useState, useEffect } from 'react';
import regionData from '../lib/region.json';

interface RegionData {
  [city: string]: {
    [town: string]: {
      code?: number;
      lat: number;
      lon: number;
      site?: number;
      site_s?: number;
      site_d?: number;
    };
  };
}

interface EarthquakeData {
  author: string;
  id: string;
  serial: number;
  status: number;
  final: number;
  rts: boolean;
  detail: number;
  reason: number;
  trigger: number;
  eq: {
    time: number;
    lon: number;
    lat: number;
    depth: number;
    mag: number;
    loc: string;
    max: number;
    area: {};
  };
  time: number;
}


function distance(latA: number, lngA: number) {
  return function(latB: number, lngB: number) {
    latA = latA * Math.PI / 180;
    lngA = lngA * Math.PI / 180;
    latB = latB * Math.PI / 180;
    lngB = lngB * Math.PI / 180;
    const sin_latA = Math.sin(Math.atan(Math.tan(latA)));
    const sin_latB = Math.sin(Math.atan(Math.tan(latB)));
    const cos_latA = Math.cos(Math.atan(Math.tan(latA)));
    const cos_latB = Math.cos(Math.atan(Math.tan(latB)));
    return Math.acos(sin_latA * sin_latB + cos_latA * cos_latB * Math.cos(lngA - lngB)) * 6371.008;
  };
}

function pga_to_float(pga: number) {
  return 2 * Math.log10(pga) + 0.7;
}

function eew_i(epicenterLocaltion: [number, number], pointLocaltion: [number, number], depth: number, magW: number) {
  const long = 10 ** (0.5 * magW - 1.85) / 2;
  const epicenterDistance = distance(epicenterLocaltion[0], epicenterLocaltion[1])(pointLocaltion[0], pointLocaltion[1]);
  const hypocenterDistance = (depth ** 2 + epicenterDistance ** 2) ** 0.5 - long;
  const x = Math.max(hypocenterDistance, 3);
  const gpv600 = 10 ** (
    0.58 * magW +
    0.0038 * depth - 1.29 -
    Math.log10(x + 0.0028 * (10 ** (0.5 * magW))) -
    0.002 * x
  );
  const arv = 1.0;
  const pgv400 = gpv600 * 1.31;
  const pgv = pgv400 * arv;
  return 2.68 + 1.72 * Math.log10(pgv);
}

function intensity_float_to_int(float: number) {
  return (float < 0) ? 0 : (float < 4.5) ? Math.round(float) : (float < 5) ? 5 : (float < 5.5) ? 6 : (float < 6) ? 7 : (float < 6.5) ? 8 : 9;
}


function update_eew_max(data: EarthquakeData, regionData: RegionData, city?: string, town?: string) {
  let eew_max_i = 0;

  if (city && town) {
    // Calculate intensity only for the specified city and town
    if (regionData[city] && regionData[city][town]) {
      const info = regionData[city][town];
      if (info.lat !== undefined && info.lon !== undefined) {
        const dist_surface = distance(data.eq.lat, data.eq.lon)(info.lat, info.lon);
        const dist = Math.sqrt(dist_surface ** 2 + data.eq.depth ** 2);
        const pga = 1.657 * Math.pow(Math.E, (1.533 * data.eq.mag)) * Math.pow(dist, -1.607);
        let i = pga_to_float(pga);
        if (i >= 4.5) i = eew_i([data.eq.lat, data.eq.lon], [info.lat, info.lon], data.eq.depth, data.eq.mag);
        eew_max_i = intensity_float_to_int(i);
      }
    }
  } else {
    // Calculate maximum intensity across all regions (current behavior)
    for (const city of Object.keys(regionData)) {
      for (const town of Object.keys(regionData[city])) {
        const info = regionData[city][town];
        // Add check for required properties
        if (info.lat === undefined || info.lon === undefined) continue;

        const dist_surface = distance(data.eq.lat, data.eq.lon)(info.lat, info.lon);
        const dist = Math.sqrt(dist_surface ** 2 + data.eq.depth ** 2);
        const pga = 1.657 * Math.pow(Math.E, (1.533 * data.eq.mag)) * Math.pow(dist, -1.607);
        let i = pga_to_float(pga);
        if (i >= 4.5) i = eew_i([data.eq.lat, data.eq.lon], [info.lat, info.lon], data.eq.depth, data.eq.mag);
        const I = intensity_float_to_int(i);
        if (I > eew_max_i) eew_max_i = I;
      }
    }
  }
  return eew_max_i;
}

function IntensityI(intensity: number): string {
  switch (intensity) {
    case 1:
      return "1";
    case 2:
      return "2";
    case 3:
      return "3";
    case 4:
      return "4";
    case 5:
      return "5-";
    case 6:
      return "5+";
    case 7:
      return "6-";
    case 8:
      return "6+";
    case 9:
      return "7";
    default:
      return "0";
  }
}

const useEarthquakeData = (p0?: { city: string | undefined; town: string | undefined; isDevMode?: boolean }) => {
  const [maxIntensity, setMaxIntensity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { city, town, isDevMode } = p0 || {};
  useEffect(() => {
    console.log('useEarthquakeData useEffect running', { city, town, isDevMode });
    const fetchData = async () => {
      try {
        const eqResponse = await fetch('https://api-1.exptech.dev/api/v1/eq/eew');
        if (!eqResponse.ok) {
          throw new Error(`HTTP error! status: ${eqResponse.status}`);
        }
        const data: EarthquakeData[] = await eqResponse.json();
        if (data && data.length > 0 && data[0].eq) {
          const calculatedMaxIntensity = update_eew_max(data[0], regionData, city, town);
          const intensityValue = IntensityI(calculatedMaxIntensity);
          setMaxIntensity(IntensityI(calculatedMaxIntensity));
        } else {
          setMaxIntensity(null); // Or a default value like '--'
        }
      } catch (err: any) {
        setError(err.message);
        setMaxIntensity(null); // Or a default value
      } finally {
        setLoading(false);
      }
    };

    const fetchDataDev = async () => {
      try {
        const data: EarthquakeData[] = [
          {
            "author": "trem",
            "id": "1718378131400",
            "serial": 2,
            "status": 0,
            "final": 1,
            "rts": true,
            "detail": 0,
            "reason": 4,
            "trigger": 3,
            "eq": {
              "time": 1718378113000,
              "lon": 121.36,
              "lat": 23.58,
              "depth": 10,
              "mag": 8,
              "loc": "花蓮縣瑞穗鄉",
              "max": 0,
              "area": {}
            },
            "time": 1718378140000
          }
        ];


        if (data && data.length > 0 && data[0].eq) {
          const calculatedMaxIntensity = update_eew_max(data[0], regionData, city, town);
          const intensityValue = IntensityI(calculatedMaxIntensity);
          setMaxIntensity(intensityValue);

        } else {
          setMaxIntensity(null); // Or a default value like '--'
        }
      } catch (err: any) {
        setError(err.message);
        setMaxIntensity(null); // Or a default value
      } finally {
        setLoading(false);
      }
    };

    if (isDevMode) {
      fetchDataDev();
    } else {
      fetchData();
    }
  }, [city, town, isDevMode]); // Added city, town and isDevMode to the dependency array

  return { maxIntensity, error, loading };
};

export { useEarthquakeData };