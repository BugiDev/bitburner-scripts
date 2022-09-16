export type Interval = [number, number];

// [[1, 3], [2, 4]]
// [[2, 4], [1, 3]]

// [[2, 4], [1, 5]]
// [[1, 5], [2, 4]]

// [[1,2],[21,25],[14,17],[4,14],[12,13],[7,12],[19,22],[9,13]]

// [[1,2], [4,14], [7,12], [9,13], [12,13], [14,17], [19,22], [21,25]]

const overlap = (first: Interval, second: Interval): Interval | null => {
  if (first[0] >= second[0] && first[0] <= second[1]) {
    const end = first[1] >= second[1] ? first[1] : second[1];
    return [second[0], end];
  }

  if (first[1] >= second[0] && first[1] <= second[1]) {
    const start = first[0] <= second[0] ? first[0] : second[0];
    return [start, second[1]];
  }

  if (first[0] <= second[0] && first[1] >= second[1]) {
    return [first[0], first[1]];
  }

  return null;
};

const overlapIntervals = (currentInterval: Interval, intervals: Interval[]): Interval[] | null => {
  for (let i = 0; i < intervals.length; i++) {
    const nextInterval = intervals[i];
    const intervalOverlap = overlap(currentInterval, nextInterval);
    if (intervalOverlap) {
      const leftoverIntervalBefore = i > 0 ? intervals.slice(0, i) : [];
      const leftoverIntervalAfter = i === intervals.length - 1 ? [] : intervals.slice(i + 1);
      return [intervalOverlap, ...leftoverIntervalBefore, ...leftoverIntervalAfter];
    }
  }
  return null;
};

export const solve = (intervals: Interval[]): Interval[] => {
  const sortedIntervals = intervals.sort((a, b) => {
    if (a[0] < b[0]) {
      return -1;
    }
    if (a[0] > b[0]) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  const nextIntervals: Interval[] = [];
  for (let i = 0; i < sortedIntervals.length; i++) {
    const currentInterval = sortedIntervals[i];
    if (i === sortedIntervals.length - 1) {
      nextIntervals.push(currentInterval);
      break;
    }

    const overlappedIntervals = overlapIntervals(currentInterval, sortedIntervals.slice(i + 1));
    if (overlappedIntervals) {
      nextIntervals.push(...overlappedIntervals);
      break;
    } else {
      nextIntervals.push(currentInterval);
    }
  }

  if (sortedIntervals.length !== nextIntervals.length) {
    return solve(nextIntervals);
  }
  return nextIntervals;
};
