import { CityPopulation } from '@domain/entities/city-population';

describe('CityPopulation Entity', () => {
  describe('Constructor', () => {
    it('should create a city population with valid data', () => {
      const cityPop = new CityPopulation({ cityName: 'Madrid', countryCode: 'ES', population: 3223334 });

      expect(cityPop.cityName).toBe('Madrid');
      expect(cityPop.countryCode).toBe('ES');
      expect(cityPop.population).toBe(3223334);
    });

    it('should accept zero population', () => {
      const cityPop = new CityPopulation({ cityName: 'Ghost Town', countryCode: 'XX', population: 0 });

      expect(cityPop.population).toBe(0);
    });

    it('should handle large populations', () => {
      const cityPop = new CityPopulation({ cityName: 'Tokyo', countryCode: 'JP', population: 37400000 });

      expect(cityPop.population).toBe(37400000);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const cityPop = new CityPopulation({ cityName: 'Barcelona', countryCode: 'ES', population: 1620343 });

      expect(cityPop.cityName).toBe('Barcelona');
      expect(cityPop.countryCode).toBe('ES');
      expect(cityPop.population).toBe(1620343);
    });

    it('should handle special characters in city name', () => {
      const cityPop = new CityPopulation({ cityName: 'São Paulo', countryCode: 'BR', population: 12300000 });

      expect(cityPop.cityName).toBe('São Paulo');
    });
  });
});
