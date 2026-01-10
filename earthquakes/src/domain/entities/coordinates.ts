export class Coordinates {
    public readonly latitude: number;
    public readonly longitude: number;
    constructor(coordinates: { latitude: number; longitude: number }) {
        this.latitude = coordinates.latitude;
        this.longitude = coordinates.longitude;
    }
}