import { NationalDish } from '@domain/entities/national-dish';

describe('NationalDish Entity', () => {
  describe('Constructor', () => {
    it('should create a national dish with all fields', () => {
      const dish = new NationalDish('Spain', 'Paella', 'www.pizza.svg', 'ES', 'A traditional Spanish rice dish');
      expect(dish.countryCode).toBe('ES');
      expect(dish.countryName).toBe('Spain');
      expect(dish.dishName).toBe('Paella');
      expect(dish.imageUrl).toBe('www.pizza.svg');
      expect(dish.description).toBe('A traditional Spanish rice dish');
    });

    it('should create a national dish without description', () => {
      const dish = new NationalDish('Spain', 'Paella', null, 'ES', undefined);

      expect(dish.countryCode).toBe('ES');
      expect(dish.countryName).toBe('Spain');
      expect(dish.imageUrl).toBeNull();
      expect(dish.description).toBeUndefined();
    });

    it('should handle empty string description', () => {
      const dish = new NationalDish('Italy', 'Pizza', 'www.pizza.svg', 'IT', '');

      expect(dish.countryCode).toBe('IT');
      expect(dish.countryName).toBe('Italy');
      expect(dish.description).toBe('');
    });
  });

  describe('toJSON', () => {
    it('should serialise to JSON with description', () => {
      const dish = new NationalDish(
        'United Kingdom',
        'Fish and Chips',
        'www.fishandchips.svg',
        'GB',
        'Battered fish with chips',
      );
      const json = dish.toJSON();

      expect(json).toEqual({
        countryCode: 'GB',
        countryName: 'United Kingdom',
        dishName: 'Fish and Chips',
        imageUrl: 'www.fishandchips.svg',
        description: 'Battered fish with chips',
      });
    });

    it('should serialise to JSON without description', () => {
      const dish = new NationalDish('Germany', 'Sauerbraten', 'www.sauerbraten.svg', 'DE', 'A German meat dish');
      const json = dish.toJSON();

      expect(json).toEqual({
        countryCode: 'DE',
        countryName: 'Germany',
        dishName: 'Sauerbraten',
        imageUrl: 'www.sauerbraten.svg',
        description: 'A German meat dish',
      });
    });

    it('should handle special characters in dish name', () => {
      const dish = new NationalDish('France', 'Crème brûlée', 'www.cremebrulee.svg', 'FR', 'A French dessert');
      const json = dish.toJSON();

      expect(json).toEqual({
        countryCode: 'FR',
        countryName: 'France',
        dishName: 'Crème brûlée',
        imageUrl: 'www.cremebrulee.svg',
        description: 'A French dessert',
      });
    });
  });
});
