'use client'

import Container from "@/components/Container";
import ForecastDetail from "@/components/ForecastDetail";
import Navbar from "@/components/Navbar";
import WeatherDetail from "@/components/WeatherDetail";
import WeatherIcons from "@/components/WeatherIcon";
import { convertKtoC } from "@/utils/convertKtoC";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { DayNightIcon } from "@/utils/DayNight";
import { metersToKilometers } from "@/utils/MetersToKilometers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import { useAtom } from "jotai";
import Image from "next/image";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";

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

   const [place,setPlace] = useAtom(placeAtom);
   const [loadingCity,setLoadingCity] = useAtom(loadingCityAtom);

  const { isPending, error, data ,refetch} = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      )
      console.log(data, 'Data');

      return data
    }
  });

  useEffect(()=>{
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

  const firstDataForEachDate = uniqueDates.map((date)=>{
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >=6;
    })
  })


  if (isPending) return (
    <div className="flex items-center min-h-screen justify-center">
      <p className=" animate-bounce text-2xl  ">Loading...</p>
    </div>
  )
  if (error) return 'An error has occured'
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen" >
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-04">

      {loadingCity ? <WeatherSkeleton/> :(
        <>
           {/*today daya */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p> {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}</p>
              <p> {format(parseISO(firstData?.dt_txt ?? ""), "(dd.MM.yyyy)")}</p>
            </h2>
            <Container className="gap-10 pc-6 items-center">
              {/* temperature */}
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKtoC(firstData?.main.temp ?? 297.31)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>
                    {convertKtoC(firstData?.main.feels_like ?? 273.15)}°
                  </span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                    {convertKtoC(firstData?.main.temp_min ?? 273.15)}°↓{" "}
                  </span>
                  <span>
                    {" "}
                    {convertKtoC(firstData?.main.temp_max ?? 273.15)}
                    °↑
                  </span>
                </p>
              </div>
              {/* time and weather icon */}
              <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                {data.list.map((d,i)=>(
                   
                  <div
                  key={i} 
                  className="flex flex-col justify-betweengap-2 items-center text-xs font-semibold">
                    <p>
                      {format(parseISO(d.dt_txt), "h:mm a")}
                    </p>
                    <WeatherIcons iconName={DayNightIcon(d.weather[0].icon, d.dt_txt)}/>
                    <p> 
                      {convertKtoC(d?.main.temp ?? 0)}°
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </div>
          <div className="flex gap-4">
            {/*left */}
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center"> {firstData?.weather[0].description} </p>
              <WeatherIcons iconName={DayNightIcon(firstData?.weather[0].icon ?? "", firstData?.dt_txt ?? "" )}/>
            </Container>
            {/*right */}
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
            <WeatherDetail visibility= {metersToKilometers(firstData?.visibility ?? 10000)}
            airPressure={`${firstData?.main.pressure} hpa`}
            humidity={`${firstData?.main.humidity}%`}
            sunrise={format(fromUnixTime(data?.city.sunrise ?? 0), "H:mm")}
            sunset={format(fromUnixTime(data?.city.sunset ?? 0), "H:mm")}
            windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
             />
            </Container>
          </div>
        </section>

        {/* 7 day forecast data */}
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7 days)</p>
          {firstDataForEachDate.map((d,i) => (
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
            sunrise={format(
              fromUnixTime(data?.city.sunrise ?? 1702517657),
              "H:mm"
            )}
            sunset={format(
              fromUnixTime(data?.city.sunset ?? 1702517657),
              "H:mm"
            )}
            visibility={`${metersToKilometers(d?.visibility ?? 10000)}`}
            windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}

             />
          ))}
          
        </section>
        </>
      ) }
     

      </main>
    </div>
  );
}


function WeatherSkeleton() {
  return (
    <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4 animate-pulse">
      {/* Today's Date */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="flex gap-1 text-2xl items-end">
            <div className="h-6 w-32 bg-gray-300 rounded" />
            <div className="h-6 w-24 bg-gray-300 rounded" />
          </h2>

          <div className="gap-10 p-6 flex flex-col md:flex-row items-center justify-between">
            {/* Temperature */}
            <div className="flex flex-col px-4 items-start">
              <div className="h-16 w-32 bg-gray-300 rounded-md" />
              <div className="h-4 w-24 bg-gray-300 rounded mt-2" />
              <div className="flex gap-2 mt-1">
                <div className="h-4 w-16 bg-gray-300 rounded" />
                <div className="h-4 w-16 bg-gray-300 rounded" />
              </div>
            </div>
            {/* Hourly Forecast */}
            <div className="flex gap-6 overflow-x-auto w-full pr-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-4 w-12 bg-gray-300 rounded" />
                  <div className="h-8 w-8 bg-gray-300 rounded-full" />
                  <div className="h-4 w-10 bg-gray-300 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Description */}
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
            <div className="h-12 w-12 bg-gray-300 rounded-full" />
          </div>
          {/* Details */}
          <div className="flex-1 bg-yellow-300/80 p-6 flex flex-col gap-4">
            {['Visibility', 'Air Pressure', 'Humidity', 'Sunrise', 'Sunset', 'Wind Speed'].map((label, i) => (
              <div key={i} className="flex justify-between w-full">
                <div className="h-4 w-24 bg-gray-300 rounded" />
                <div className="h-4 w-20 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7-day forecast */}
      <section className="flex w-full flex-col gap-4">
        <div className="h-6 w-40 bg-gray-300 rounded" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded-md">
            <div className="h-4 w-20 bg-gray-300 rounded" />
            <div className="h-8 w-8 bg-gray-300 rounded-full" />
            <div className="h-4 w-16 bg-gray-300 rounded" />
            <div className="h-4 w-16 bg-gray-300 rounded" />
            <div className="h-4 w-16 bg-gray-300 rounded" />
          </div>
        ))}
      </section>
    </main>
  );
}
