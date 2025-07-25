import React from 'react'
import { FiDroplet } from 'react-icons/fi';
import { ImMeter } from 'react-icons/im';
import { LuEye, LuSunrise, LuSunset } from 'react-icons/lu';
import { MdAir } from 'react-icons/md';

type Props = {}

export interface WeatherDetailProps {
    visibility: string;
    humidity: string;
    windSpeed: string;
    airPressure: string
}
export default function WeatherDetail(props: WeatherDetailProps) {

    const {
        visibility = "25km",
        humidity = "61%",
        windSpeed = "7 km/h",
        airPressure = "1012 hpa",
    } = props;
    return <>
        <SingleWeatherDetail
            icon={<LuEye />}
            information="Visibility"
            value={props.visibility} />
        <SingleWeatherDetail
            icon={<FiDroplet />}
            information="Humidity"
            value={props.humidity} />
        <SingleWeatherDetail
            icon={<MdAir />}
            information="Wind Speed"
            value={props.windSpeed} />
        <SingleWeatherDetail
            icon={<ImMeter />}
            information="Air Pressure"
            value={props.airPressure} />
    </>
}

export interface SingleWeatherDetailProps {
    information: string;
    icon: React.ReactNode;
    value: string;
}

function SingleWeatherDetail(props: SingleWeatherDetailProps) {
    return (
        <div className='flex flex-col text-white/50 justify-between gap-2 items-center text-xs font-semibold'>
            <p className='whitespace-nowrap'>{props.information}</p>
            <div className='text-3xl'>{props.icon} </div>
            <p> {props.value} </p>
        </div>
    )
}