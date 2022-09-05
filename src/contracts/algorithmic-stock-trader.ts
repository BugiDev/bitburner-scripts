export function solve(stocks: number[], _transactions: number): number {
  const maxMoney = Math.max(
    ...stocks.map((stock: number, index: number): number => {
      return Math.max(
        ...stocks.slice(index + 1).map((nextStock: number): number => {
          return nextStock - stock;
        })
      );
    })
  );

  return maxMoney > 0 ? maxMoney : 0;
}
