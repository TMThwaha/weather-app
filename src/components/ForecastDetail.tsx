import React from 'react'
import WeatherDetail, { WeatherDetailProps } from './WeatherDetail';
import Container from './Container';
import WeatherIcon from './WeatherIcon';
import { convertKtoC } from '@/utils/convertKtoC';




export interface ForcastDetailProps extends WeatherDetailProps {
  weatherIcon:string;
  date: string;
  day: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
}


export default function ForecastDetail(
  props: ForcastDetailProps
) {
  const {
    weatherIcon = "02d",
    date = "19.09",
    day = "Tuesday",
    temp,
    feels_like,
    temp_min,
    temp_max,
    description

  } = props

  return (
   <Container className='gap-6 py-8 text-white flex flex-col sm:flex-row items-center'>
    {/**left */}
    <section className='flex gap-4 items-center px-4'>
    <div className='flex flex-col gap-1 items-center'>
      <WeatherIcon size={"w-16 h-16"} iconname = {weatherIcon} />
      <p> {date} </p>
      <p className='text-sm'> {day} </p>
    </div>

    <div className='flex flex-col px-4'>
       <span className='text-5xl '>{convertKtoC(temp ?? 0)}° </span>
       <p className='text-xs space-x-1 whitespace-nowrap'>
        <span>Feels Like</span>
        <span>{convertKtoC(feels_like ?? 0)}°</span>
       </p>
       <p className='capitalize'> {description} </p>
    </div>
    </section>
    {/**right */}
    <section className='overflow-x-auto justify-between grid grid-cols-2 md:grid-cols-4  gap-4 px-4 w-full pr-10'>
      <WeatherDetail {...props}/>
    </section>
   </Container>
  )
}