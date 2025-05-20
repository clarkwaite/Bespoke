export const isBetweenTwoDates = ({ date, dateFilter }: { date: string, dateFilter: { startDate: string, endDate: string } }): boolean => {
    const newDate = new Date(date)
    const startDate = new Date(dateFilter.startDate)
    const endDate = new Date(dateFilter.endDate)
    return newDate.valueOf() >= startDate.valueOf() && newDate.valueOf() <= endDate.valueOf()
}