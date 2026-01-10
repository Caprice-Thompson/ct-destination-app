export interface EarthquakeRepository {
    getMostRecentEarthquakes(dateRange: { from: string; to: string }): Promise<Earthquake[]>;
}

export interface CoordinatesRepository {
    getCoordinates(latitude: number, longitude: number): Promise<Coordinates>;
}