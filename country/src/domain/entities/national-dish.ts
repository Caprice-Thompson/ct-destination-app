export class NationalDish {
  constructor(
    public readonly countryName: string,
    public readonly dishName: string,
    public readonly imageUrl: string | null,
    public readonly countryCode: string | null,
    public readonly description?: string,
  ) {}

  toJSON() {
    return {
      countryCode: this.countryCode ?? null,
      countryName: this.countryName,
      dishName: this.dishName,
      imageUrl: this.imageUrl,
      description: this.description,
    };
  }
}
