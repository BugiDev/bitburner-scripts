export function solve(stocks) {
    const allTransactions = stocks.reduce((totalTransactions, stock, index) => {
        if (index === stocks.length - 1) {
            return [...totalTransactions, { buy: stock, sell: 0, profit: 0 }];
        }
        const nextStocks = stocks.slice(index + 1);
        const transactions = nextStocks.map((nextStock) => {
            const profit = nextStock - stock > 0 ? nextStock - stock : 0;
            return { buy: stock, sell: nextStock, profit };
        });
        return [...totalTransactions, ...transactions];
    }, []);
    const sortedTransactions = allTransactions.sort((a, b) => {
        if (a.profit < b.profit) {
            return 1;
        }
        if (a.profit > b.profit) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });
    return sortedTransactions[0].profit;
}
