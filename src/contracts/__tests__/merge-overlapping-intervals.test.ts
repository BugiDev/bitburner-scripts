import { Interval, solve } from '../merge-overlapping-intervals';

describe('Merge overlapping intervals', () => {
  test.each([
    [
      [
        [1, 2],
        [21, 25],
        [14, 17],
        [4, 14],
        [12, 13],
        [7, 12],
        [19, 22],
        [9, 13],
      ] as Interval[],
      [
        [1, 2],
        [4, 17],
        [19, 25],
      ] as Interval[],
    ],
    [
      [
        [1, 2],
        [21, 25],
        [14, 17],
        [4, 14],
        [12, 13],
        [7, 12],
        [19, 22],
        [9, 13],
        [30, 32],
        [18, 28],
      ] as Interval[],
      [
        [1, 2],
        [4, 17],
        [18, 28],
        [30, 32],
      ] as Interval[],
    ],
    [
      [
        [8, 12],
        [14, 17],
        [3, 13],
        [7, 15],
        [11, 17],
        [8, 15],
        [18, 20],
        [24, 34],
        [5, 12],
        [17, 24],
        [8, 17],
        [20, 25],
        [20, 24],
        [17, 26],
        [10, 15],
        [11, 18],
      ] as Interval[],
      [[3, 34]] as Interval[],
    ],
    [
      [
        [17, 18],
        [15, 23],
        [14, 23],
        [22, 24],
        [23, 32],
        [15, 19],
        [14, 15],
        [7, 13],
        [14, 17],
        [24, 26],
        [22, 24],
        [16, 25],
        [3, 9],
        [5, 9],
        [20, 29],
        [25, 29],
        [25, 28],
        [22, 26],
        [16, 26],
      ] as Interval[],
      [
        [3, 13],
        [14, 32],
      ] as Interval[],
    ],
  ])('testing %s', (intervals: Interval[], expected: Interval[]) => {
    expect(solve(intervals)).toStrictEqual(expected);
  });
});
