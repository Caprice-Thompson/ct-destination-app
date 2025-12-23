export class NationalDish {
  constructor(
    public readonly countryCode: string,
    public readonly countryName: string,
    public readonly dishName: string,
    public readonly imageUrl: string | null,
    public readonly description?: string,
  ) {}

  toJSON() {
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      dishName: this.dishName,
      imageUrl: this.imageUrl,
      description: this.description,
    };
  }
}
