import { NationalDish } from '@domain/entities/national-dish';

describe('NationalDish Entity', () => {
  describe('Constructor', () => {
    it('should create a national dish with all fields', () => {
      const dish = new NationalDish('ES', 'Paella', 'A traditional Spanish rice dish');

      expect(dish.countryCode).toBe('ES');
      expect(dish.dishName).toBe('Paella');
      expect(dish.description).toBe('A traditional Spanish rice dish');
    });

    it('should create a national dish without description', () => {
      const dish = new NationalDish('FR', 'Pot-au-feu');

      expect(dish.countryCode).toBe('FR');
      expect(dish.dishName).toBe('Pot-au-feu');
      expect(dish.description).toBeUndefined();
    });

    it('should handle empty string description', () => {
      const dish = new NationalDish('IT', 'Pizza', '');

      expect(dish.description).toBe('');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with description', () => {
      const dish = new NationalDish('GB', 'Fish and Chips', 'Battered fish with chips');
      const json = dish.toJSON();

      expect(json).toEqual({
        countryCode: 'GB',
        dishName: 'Fish and Chips',
        description: 'Battered fish with chips',
      });
    });

    it('should serialize to JSON without description', () => {
      const dish = new NationalDish('DE', 'Sauerbraten');
      const json = dish.toJSON();

      expect(json).toEqual({
        countryCode: 'DE',
        dishName: 'Sauerbraten',
        description: undefined,
      });
    });

    it('should handle special characters in dish name', () => {
      const dish = new NationalDish('FR', 'Crème brûlée', 'A French dessert');
      const json = dish.toJSON();

      expect(json.dishName).toBe('Crème brûlée');
    });
  });
});
