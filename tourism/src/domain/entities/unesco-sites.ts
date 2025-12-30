export class UNESCOSites {
  constructor(
    public readonly countryCode: string,
    public readonly countryName: string,
    public readonly areaName: string,
    public readonly site: string,
    public readonly description?: string,
  ) {}

  toJSON() {
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      areaName: this.areaName,
      site: this.site,
      description: this.description,
    };
  }
}
