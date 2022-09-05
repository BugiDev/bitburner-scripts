export function solve(numbersArray: number[]): boolean {
  const currentMaxJump = numbersArray[0];
  const lastIndex = numbersArray.length - 1;

  // Can't jump, early return
  if (currentMaxJump === 0) {
    return false;
  }

  if (currentMaxJump >= lastIndex) {
    return true;
  } else {
    let result = false;
    for (let i = 1; i <= currentMaxJump; i++) {
      result = result || solve(numbersArray.slice(i));
    }
    return result;
  }
}
