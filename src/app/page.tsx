'use client'

import Container from "@/components/Container";
import ForecastDetail from "@/components/ForecastDetail";
import Navbar from "@/components/Navbar";
import WeatherIcon from "@/components/WeatherIcon";
import { convertKtoC } from "@/utils/convertKtoC";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { DayNightIcon } from "@/utils/DayNight";
import { metersToKilometers } from "@/utils/MetersToKilometers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO, isValid } from "date-fns";
import { useAtom } from "jotai";
import Image from "next/image";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";
import { Droplets, Eye, Gauge, Star, Sunrise, Sunset, TrendingUp, Wind } from "lucide-react";
import MetriCard from "@/components/MetriCard";

//https://api.openweathermap.org/data/2.5/forecast?q=pune&appid=ce4171666272d684f6e4f20c290a6e60&cnt=56

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherEntry[];
  city: City;
}

interface WeatherEntry {
  dt: number;
  main: MainWeather;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  sys: Sys;
  dt_txt: string;
}

interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Clouds {
  all: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Sys {
  pod: string;
}

interface City {
  id: number;
  name: string;
  coord: Coordinates;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

interface Coordinates {
  lat: number;
  lon: number;
}


export default function Home() {

  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);

  const { isPending, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      )
      console.log(data, 'Data');

      return data
    }
  });

  useEffect(() => {
    refetch()
  }, [place, refetch]);

  const firstData = data?.list[0];

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ]

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    })
  })


  if (isPending) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-bounce text-white text-xl">Loading...</p>
      </div>
    </div>
  )


  if (error) return 'An error has occured'
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 relative overflow-hidden" >
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <Navbar location={data?.city.name} />
      <main className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {loadingCity ? <WeatherSkeleton /> : (
            <>
              {/*current weather */}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
                <Container className="lg:col-span-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="space-y-2">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-7xl font-thin text-white">
                          {convertKtoC(firstData?.main.temp ?? 297.31)}°
                        </span>
                        <span className="text-2xl text-white/70">C</span>
                      </div>
                      <p className="text-white/80 text-lg capitalize">{firstData?.weather[0].description}</p>
                      <p className="text-white/60">Feels like {convertKtoC(firstData?.main.feels_like ?? 273.15)}°</p>
                      <div className="flex items-center space-x-4 text-white/60">
                        <span className="flex items-center space-x-1">
                          <TrendingUp size={16} />
                          <span>{convertKtoC(firstData?.main.temp_max ?? 0)}°</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <TrendingUp size={16} className="rotate-180" />
                          <span>{convertKtoC(firstData?.main.temp_min ?? 0)}°</span>
                        </span>
                      </div>
                    </div>
                    <WeatherIcon iconname={firstData?.weather[0].icon ?? ""} size="w-32 h-32" />
                  </div>
                </Container>
                <div className="space-y-4 lg:col-span-3">
                  <MetriCard
                    icon={Eye}
                    label="Visibility"
                    unit="km"
                    value={firstData?.visibility}
                    color="text-cyan-400"
                  />
                  <MetriCard
                    icon={Wind}
                    label="Wind Speed"
                    value={firstData?.wind.speed}
                    unit="km/h"
                    color="text-green-400"
                  />
                </div>
              </div>



              {/* /**24 hour forcast */}
              <Container className="flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">24-Hour Forecast</h2>
                  <Star className="text-yellow-400" size={24} />
                </div>
                {/* time and weather icon */}
                <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                  {data.list.map((d, i) => (

                    <div
                      key={i}
                      className="flex-shrink-0 text-white/70 text-sm text-center space-y-3 p-4 rounded-2xl transition-all duration-300 min-w-[80px]">
                      <p className="text-white/70 text-sm">
                        {format(parseISO(d.dt_txt), "h:mm a")}
                      </p>
                      <WeatherIcon size={'w-16 h-16'} iconname={DayNightIcon(d.weather[0].icon, d.dt_txt)} />
                      <p>
                        {convertKtoC(d?.main.temp ?? 0)}°
                      </p>
                    </div>
                  ))}
                </div>
              </Container>



              {/* Weather Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetriCard
                  icon={Droplets}
                  label="Humidity"
                  value={firstData?.main.humidity}
                  unit="%"
                  color="text-blue-400"
                />
                <MetriCard
                  icon={Gauge}
                  label="Pressure"
                  value={firstData?.main.pressure}
                  unit="hPa"
                  color="text-purple-400"
                />
                <MetriCard
                  icon={Sunrise}
                  label="Sunrise"
                  value={format(fromUnixTime(data?.city.sunrise ?? 0), "H:mm")}
                  unit=""
                  color="text-orange-400"
                />
                <MetriCard
                  icon={Sunset}
                  label="Sunset"
                  value={format(fromUnixTime(data?.city.sunset ?? 0), "H:mm")}
                  unit=""
                  color="text-red-400"
                />
              </div>
              {/* </section> */}




              {/* 7 day forecast data */}
              <section className="flex w-full flex-col text-white gap-4">
                <p className="text-2xl">Forecast (5 days)</p>
                <div className="flex justify-between flex-col gap-4">
                  {firstDataForEachDate.slice(1, 6).map((d, i) => (
                    <ForecastDetail
                      key={i}
                      description={d?.weather[0].description ?? ""}
                      weatherIcon={d?.weather[0].icon ?? "01d"}
                      date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
                      day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                      feels_like={d?.main.feels_like ?? 0}
                      temp={d?.main.temp ?? 0}
                      temp_max={d?.main.temp_max ?? 0}
                      temp_min={d?.main.temp_min ?? 0}
                      airPressure={`${d?.main.pressure} hPa`}
                      humidity={`${d?.main.humidity}%`}
                      visibility={`${metersToKilometers(d?.visibility ?? 10000)}`}
                      windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}

                    />
                  ))}
                </div>
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}


function WeatherSkeleton() {
  return (
    <div className="relative z-10 px-6 pb-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Weather Card Skeleton */}
        <Container className="lg:col-span-3 animate-pulse">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-2">
              {/* Temperature skeleton */}
              <div className="flex items-baseline space-x-2">
                <div className="h-20 w-32 bg-white/20 rounded-lg"></div>
                <div className="h-8 w-6 bg-white/20 rounded"></div>
              </div>
              {/* Description skeleton */}
              <div className="h-6 w-40 bg-white/20 rounded"></div>
              {/* Feels like skeleton */}
              <div className="h-4 w-32 bg-white/20 rounded"></div>
              {/* Min/Max temps skeleton */}
              <div className="flex items-center space-x-4">
                <div className="h-4 w-16 bg-white/20 rounded"></div>
                <div className="h-4 w-16 bg-white/20 rounded"></div>
              </div>
            </div>
            {/* Weather icon skeleton */}
            <div className="w-32 h-32 bg-white/20 rounded-full"></div>
          </div>
        </Container>

        {/* Metrics Cards Skeleton */}
        <div className="space-y-4 lg:col-span-3">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Container key={i} className="text-center flex justify-center animate-pulse">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-white/20 rounded"></div>
                    <div className="h-6 w-20 bg-white/20 rounded"></div>
                  </div>
                </div>
              </Container>
            ))}
          </div>
        </div>

        {/* 24-Hour Forecast Skeleton */}
        <Container className="flex-col animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-white/20 rounded"></div>
            <div className="w-6 h-6 bg-white/20 rounded"></div>
          </div>

          <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 space-y-3 p-4 min-w-[80px]">
                <div className="h-4 w-16 bg-white/20 rounded mx-auto"></div>
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto"></div>
                <div className="h-4 w-12 bg-white/20 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </Container>

        {/* Weather Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Container key={i} className="text-center flex justify-center group animate-pulse">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-white/20 rounded"></div>
                  <div className="h-6 w-20 bg-white/20 rounded"></div>
                </div>
              </div>
            </Container>
          ))}
        </div>

        {/* 5-Day Forecast Skeleton */}
        <section className="flex w-full flex-col text-white gap-4">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse"></div>
          <div className="flex justify-between flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <Container key={i} className="gap-6 py-8 text-white flex flex-col sm:flex-row items-center animate-pulse">
                {/* Left section skeleton */}
                <section className="flex gap-4 items-center px-4">
                  <div className="flex flex-col gap-1 items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full"></div>
                    <div className="h-4 w-12 bg-white/20 rounded"></div>
                    <div className="h-3 w-16 bg-white/20 rounded"></div>
                  </div>

                  <div className="flex flex-col px-4 space-y-2">
                    <div className="h-12 w-20 bg-white/20 rounded"></div>
                    <div className="h-3 w-24 bg-white/20 rounded"></div>
                    <div className="h-4 w-32 bg-white/20 rounded"></div>
                  </div>
                </section>

                {/* Right section skeleton */}
                <section className="overflow-x-auto justify-between grid grid-cols-2 md:grid-cols-4 gap-4 px-4 w-full pr-10">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex flex-col justify-between gap-2 items-center">
                      <div className="h-3 w-16 bg-white/20 rounded"></div>
                      <div className="w-8 h-8 bg-white/20 rounded"></div>
                      <div className="h-3 w-12 bg-white/20 rounded"></div>
                    </div>
                  ))}
                </section>
              </Container>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}