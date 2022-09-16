export const solve = (numbers: number[]) => {
  const results = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let k = numbers.length; k > i; k--) {
      const newArray = numbers.slice(i, k);
      const sum = sumArray(newArray);
      results.push({ arr: newArray, sum });
    }
  }

  const sortedResult = results.sort((a, b) => {
    if (a.sum < b.sum) {
      return 1;
    }
    if (a.sum > b.sum) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });

  console.log(sortedResult);
  return sortedResult[0].sum;
};

const sumArray = (arr: number[]) => {
  return arr.reduce((a, b) => a + b, 0);
};
