export const isBetweenTwoDates = ({ date, dateFilter }: { date: string, dateFilter: { startDate: string, endDate: string } }): boolean => {
    const saleDate = new Date(date).setHours(0, 0, 0, 0)
    const startDate = new Date(dateFilter.startDate).setHours(0, 0, 0, 0)
    const endDate = new Date(dateFilter.endDate).setHours(23, 59, 59, 999)

    return saleDate >= startDate && saleDate <= endDate
}