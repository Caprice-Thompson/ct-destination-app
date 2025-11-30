import { NationalDish } from '@domain/entities/national-dish';

describe('NationalDish Entity', () => {
  describe('Constructor', () => {
    it('should create a national dish with all fields', () => {
      const dish = new NationalDish('ES', 'Paella', 'www.pizza.svg', 'A traditional Spanish rice dish');
      expect(dish.countryCode).toBe('ES');
      expect(dish.dishName).toBe('Paella');
      expect(dish.imageUrl).toBe('www.pizza.svg');
      expect(dish.description).toBe('A traditional Spanish rice dish');
    });

    it('should create a national dish without description', () => {
      const dish = new NationalDish('ES', 'Paella', null, undefined);

      expect(dish.countryCode).toBe('ES');
      expect(dish.imageUrl).toBeNull();
      expect(dish.description).toBeUndefined();
    });

    it('should handle empty string description', () => {
      const dish = new NationalDish('IT', 'Pizza', 'www.pizza.svg', '');

      expect(dish.description).toBe('');
    });
  });

  describe('toJSON', () => {
    it('should serialise to JSON with description', () => {
      const dish = new NationalDish('GB', 'Fish and Chips', null, 'Battered fish with chips');
      const json = dish.toJSON();

      expect(json).toEqual({
        countryCode: 'GB',
        dishName: 'Fish and Chips',
        imageUrl: null,
        description: 'Battered fish with chips',
      });
    });

    it('should serialise to JSON without description', () => {
      const dish = new NationalDish('DE', 'Sauerbraten', null, 'A German meat dish');
      const json = dish.toJSON();

      expect(json).toEqual({
        countryCode: 'DE',
        dishName: 'Sauerbraten',
        imageUrl: null,
        description: 'A German meat dish',
      });
    });

    it('should handle special characters in dish name', () => {
      const dish = new NationalDish('FR', 'Crème brûlée', 'A French dessert');
      const json = dish.toJSON();

      expect(json.dishName).toBe('Crème brûlée');
    });
  });
});
