export const isBetweenTwoDates = ({ date, dateFilter }: { date: string, dateFilter: { startDate: string, endDate: string } }): boolean => {
    const newDate = new Date(date.split('T')[0]).valueOf()
    const startDate = new Date(dateFilter.startDate).valueOf()
    const endDate = new Date(dateFilter.endDate).valueOf()
    return newDate >= startDate && newDate <= endDate
}