import { solve } from '../min-path-sum-in-triangle';

describe('Merge overlapping intervals', () => {
  test.each([
    [[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]], 11],
    [[[5], [9, 2], [1, 9, 2], [1, 2, 1, 8], [9, 9, 8, 3, 3]], 13],
    [[[2], [6, 3], [5, 2, 2], [4, 5, 3, 9], [3, 2, 8, 7, 6]], 14],
  ])('testing %s', (triangle: number[][], expected: number) => {
    expect(solve(triangle)).toStrictEqual(expected);
  });
});
