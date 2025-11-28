export class NationalDish {
  constructor(
    public readonly countryCode: string,
    public readonly dishName: string,
    public readonly description?: string,
  ) {}

  toJSON() {
    return {
      countryCode: this.countryCode,
      dishName: this.dishName,
      description: this.description,
    };
  }
}
