import { hello } from '../../src/index';

describe('hello', () => {
  it('should return greeting message', () => {
    expect(hello('World')).toBe('Hello, World!');
  });
});

