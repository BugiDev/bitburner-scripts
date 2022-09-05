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
  ])('testing %s', (numbersArray: number[], expected: boolean) => {
    expect(solve(numbersArray)).toBe(expected);
  });
});
