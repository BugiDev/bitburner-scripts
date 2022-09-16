import { solve } from '../algorithmic-stock-trader';

describe('Algorithmic stock trader', () => {
  test.each([
    [[3, 0, 0], 0],
    [[1, 3, 0], 2],
    [[129, 93, 127, 12, 130, 17, 129, 108], 118],
    [
      [
        148, 127, 64, 144, 105, 65, 74, 74, 77, 117, 49, 189, 172, 175, 29, 153, 145, 165, 125, 58,
        111, 112, 196, 188, 58, 3, 57, 44, 73, 114, 1, 191, 111, 139, 190, 158, 102, 198, 142,
      ],
      197,
    ],
  ])('testing %s', (numbersArray: number[], expected: number) => {
    expect(solve(numbersArray)).toBe(expected);
  });
});
