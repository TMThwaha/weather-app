
export  function convertWindSpeed(speedMetersPerSecond: number): string {
    const speedInKmPerHour = speedMetersPerSecond * 3.6;
    return `${speedInKmPerHour.toFixed(0)}km/h`
}