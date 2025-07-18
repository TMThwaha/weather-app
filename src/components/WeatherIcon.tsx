
import React from 'react'

type IconKey =
  | "01d" | "01n" | "02d" | "02n"
  | "03d" | "03n" | "04d" | "04n"
  | "09d" | "09n" | "10d" | "10n"
  | "11d" | "11n" | "13d" | "13n"
  | "50d" | "50n";


  
interface WeatherIconProps extends Omit<React.HTMLProps<HTMLDivElement>,'size'> {
  iconname: IconKey | string; // string fallback for unknowns
  size: string;
}

export default function WeatherIcon({ iconname,size, className, ...rest }: WeatherIconProps) {
  const iconMap: Record<IconKey, string> = {
    "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "☁️",
    "03d": "☁️", "03n": "☁️", "04d": "☁️", "04n": "☁️",
    "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️",
    "50d": "🌫️", "50n": "🌫️"
  };

  return (
    <div className={`${size}`}>
      <div
        className={`flex items-center justify-center text-4xl filter text-white drop-shadow-sm w-full h-full bg-white/20 backdrop-blur-sm rounded-full${className || ''}`}
        {...rest}
      >
        {iconMap[iconname as IconKey] || "☀️"}
      </div>
    </div>
  );
}
