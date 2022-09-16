import { solve } from '../subarray-with-max-sum';

describe('Subarray with max sum', () => {
  test.each([
    [[-8, 5, -8, 1, 5, 2, 3, -10, -1, 4, -4, -9, 0, 1, 4], 11],
    [
      [
        -9, 10, 6, -7, -7, -4, -4, -9, -8, 7, 4, 9, -9, 1, -10, 4, -3, -9, 8, -6, 6, 9, -7, -3, -3,
        4, -6, -2, 1, -6, -1, -7, 10, -1, -8, 0, 10, -3, 5,
      ],
      20,
    ],
  ])('testing %s', (numbersArray: number[], expected: number) => {
    expect(solve(numbersArray)).toBe(expected);
  });
});
