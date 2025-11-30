export class NationalDish {
  constructor(
    public readonly countryCode: string,
    public readonly dishName: string,
    public readonly imageUrl: string | null,
    public readonly description?: string,
  ) {}

  toJSON() {
    return {
      countryCode: this.countryCode,
      dishName: this.dishName,
      imageUrl: this.imageUrl,
      description: this.description,
    };
  }
}
