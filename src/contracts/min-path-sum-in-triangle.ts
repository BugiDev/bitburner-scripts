interface PathSum {
  path: number[];
  sum: number;
}

export const solve = (triangle: number[][]): number => {
  const pathSums: PathSum[] = recursion(triangle, [triangle[0][0]], 0, 0);
  const sortedPathSums: PathSum[] = pathSums.sort((a, b) => {
    if (a.sum < b.sum) {
      return -1;
    }
    if (a.sum > b.sum) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  return sortedPathSums[0].sum;
};

const recursion = (
  triangle: number[][],
  previousPath: number[],
  parentRowIndex: number,
  parentIndex: number
): PathSum[] => {
  const childrenRowIndex = parentRowIndex + 1;
  if (childrenRowIndex === triangle.length) {
    return [{ path: previousPath, sum: previousPath.reduce((a, b) => a + b, 0) }];
  }

  const childrenRow = triangle[parentRowIndex + 1];
  const left = childrenRow[parentIndex];
  const leftRecursion: any = recursion(
    triangle,
    [...previousPath, left],
    childrenRowIndex,
    parentIndex
  );
  const right = childrenRow[parentIndex + 1];
  const rightRecursion: any = recursion(
    triangle,
    [...previousPath, right],
    childrenRowIndex,
    parentIndex + 1
  );
  return [...leftRecursion, ...rightRecursion];
};
