'use client'

import React, { useState } from 'react'
import { MdWbSunny, MdMyLocation, MdOutlineLocationOn } from "react-icons/md";
import { Search, Navigation } from "lucide-react";
import SearchBox from './SearchBox';
import axios from 'axios';
import { useAtom } from 'jotai';
import { loadingCityAtom, placeAtom } from '@/app/atom';

type Props = {
    location?: string
}

export default function Navbar({ location }: Props) {
    const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY
    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [place, setPlace] = useAtom(placeAtom);
    const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);
    const [currentTime, setCurrentTime] = useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    async function handleInputChange(value: string) {
        setCity(value);
        if (value.length >= 3) {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
                );
                const suggestions = response.data.list.map((item: any) => item.name);
                setSuggestions(suggestions);
                setError("");
                setShowSuggestions(true)
            } catch (error) {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
    }

    function handleSuggestionClick(value: string) {
        setCity(value);
        setShowSuggestions(false);
    }

    function handleSubmitSearch() {
        setLoadingCity(true)
        if (suggestions.length == 0) {
            setError("Location Not Found");
            setLoadingCity(false)
        } else {
            setError("");
            setTimeout(() => {
                setLoadingCity(false)
                setPlace(city);
                setShowSuggestions(false)
            }, 500);
        }
    }

    function handleCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    setLoadingCity(true);
                    const response = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
                    );
                    setTimeout(() => {
                        setLoadingCity(false)
                        setPlace(response.data.name)
                    }, 500);

                } catch (error) {
                    setLoadingCity(false)
                }
            })
        }
    }

    return (
        <header className="relative z-10 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                    {/* Brand Section */}
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl animate-bounce">
                            <MdWbSunny />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Weather</h1>
                            <p className="text-white/70">{currentTime.toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Search city..."
                                className="w-64 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmitSearch()}
                            />
                            <button 
                                onClick={handleSubmitSearch} 
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
                            >
                                <Search size={20} />
                            </button>
                            <SuggestionBox
                                showSuggestions={showSuggestions}
                                suggestions={suggestions}
                                handleSuggestionClick={handleSuggestionClick}
                                error={error}
                            />
                        </div>
                        <button 
                            onClick={handleCurrentLocation}
                            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300"
                        >
                            <Navigation size={20} />
                        </button>
                    </div>
                </div>

                {/* Location Info */}
                <div className="flex items-center space-x-2 mb-8">
                    <MdOutlineLocationOn className="text-white/70" size={20} />
                    <span className="text-white text-lg">{location}</span>
                    <span className="text-white/50">•</span>
                    <span className="text-white/70">{currentTime.toDateString()}</span>
                </div>
            </div>
        </header>
    )
}

function SuggestionBox({
    showSuggestions,
    suggestions,
    handleSuggestionClick,
    error
}: {
    showSuggestions: boolean;
    suggestions: string[];
    handleSuggestionClick: (item: string) => void;
    error: string
}) {
    return (
        <>
            {((showSuggestions && suggestions.length > 1) || error) && (
                <ul className='absolute bg-white/10 backdrop-blur-md border border-white/20 top-[60px] left-0 rounded-2xl min-w-[200px] flex flex-col gap-1 py-2 px-2 shadow-xl z-50'>
                    {error && suggestions.length < 1 && (
                        <li className='text-red-400 p-2 text-sm'>{error}</li>
                    )}
                    {suggestions.map((item, i) => (
                        <li
                            key={i}
                            onClick={() => handleSuggestionClick(item)}
                            className='cursor-pointer p-2 rounded-xl hover:bg-white/10 text-white transition-all duration-200 text-sm'
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}