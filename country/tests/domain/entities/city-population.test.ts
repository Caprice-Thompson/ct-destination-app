import { CityPopulation } from '@domain/entities/city-population';

describe('CityPopulation Entity', () => {
  describe('Constructor', () => {
    it('should create a city population with valid data', () => {
      const cityPop = new CityPopulation('Madrid', 'ES', 3223334);

      expect(cityPop.cityName).toBe('Madrid');
      expect(cityPop.countryCode).toBe('ES');
      expect(cityPop.population).toBe(3223334);
    });

    it('should accept zero population', () => {
      const cityPop = new CityPopulation('Ghost Town', 'XX', 0);

      expect(cityPop.population).toBe(0);
    });

    it('should throw error for negative population', () => {
      expect(() => {
        new CityPopulation('Invalid City', 'XX', -1000);
      }).toThrow('Population cannot be negative');
    });

    it('should handle large populations', () => {
      const cityPop = new CityPopulation('Tokyo', 'JP', 37400000);

      expect(cityPop.population).toBe(37400000);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const cityPop = new CityPopulation('Barcelona', 'ES', 1620343);
      const json = cityPop.toJSON();

      expect(json).toEqual({
        cityName: 'Barcelona',
        countryCode: 'ES',
        population: 1620343,
      });
    });

    it('should handle special characters in city name', () => {
      const cityPop = new CityPopulation('São Paulo', 'BR', 12300000);
      const json = cityPop.toJSON();

      expect(json.cityName).toBe('São Paulo');
    });
  });
});
