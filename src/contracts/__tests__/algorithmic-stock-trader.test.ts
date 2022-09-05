import { solve } from '../algorithmic-stock-trader';

describe('Algorithmic stock trader', () => {
  test.each([
    [[3, 0, 0], 1, 0],
    [[1, 3, 0], 1, 2],
    [[129, 93, 127, 12, 130, 17, 129, 108], 1, 118],
  ])('testing %s', (numbersArray: number[], transactions: number, expected: number) => {
    expect(solve(numbersArray, transactions)).toBe(expected);
  });
});
