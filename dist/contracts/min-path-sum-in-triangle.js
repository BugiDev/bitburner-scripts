export const solve = (triangle) => {
    const pathSums = recursion(triangle, [triangle[0][0]], 0, 0);
    const sortedPathSums = pathSums.sort((a, b) => {
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
const recursion = (triangle, previousPath, parentRowIndex, parentIndex) => {
    const childrenRowIndex = parentRowIndex + 1;
    if (childrenRowIndex === triangle.length) {
        return [{ path: previousPath, sum: previousPath.reduce((a, b) => a + b, 0) }];
    }
    const childrenRow = triangle[parentRowIndex + 1];
    const left = childrenRow[parentIndex];
    const leftRecursion = recursion(triangle, [...previousPath, left], childrenRowIndex, parentIndex);
    const right = childrenRow[parentIndex + 1];
    const rightRecursion = recursion(triangle, [...previousPath, right], childrenRowIndex, parentIndex + 1);
    return [...leftRecursion, ...rightRecursion];
};
