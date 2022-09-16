import { solve } from '../array-jumping-game';

describe('Array Jumping Game', () => {
  test.each([
    [[3, 0, 0], true],
    [[0, 0, 0], false],
    [[1, 0, 0], false],
    [[1, 1, 0], true],
    [[1, 1, 0, 0], false],
    [[7, 5, 1, 0, 0, 6, 0, 0, 4, 4, 2, 3], true],
    [[7, 5, 1, 0, 0, 5, 0, 0, 1, 1, 0, 1], false],
    [[1, 0, 0, 1, 5, 10, 0, 8, 9, 0, 10], false],
    [[10, 0, 0, 0, 4, 0, 3, 6, 7, 0, 6], true],
    [[4, 3, 0, 5, 0, 3, 2, 4, 3, 4, 5, 1, 2, 6, 1, 1, 1, 3, 1, 1, 4, 4, 2, 3], true],
  ])('testing %s', (numbersArray: number[], expected: boolean) => {
    expect(solve(numbersArray)).toBe(expected);
  });
});
