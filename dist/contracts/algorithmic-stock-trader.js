export function solve(stocks, _transactions) {
    const maxMoney = Math.max(...stocks.map((stock, index) => {
        return Math.max(...stocks.slice(index + 1).map((nextStock) => {
            return nextStock - stock;
        }));
    }));
    return maxMoney > 0 ? maxMoney : 0;
}
