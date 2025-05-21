export const isBetweenTwoDates = ({ date, dateFilter }: { date: string, dateFilter: { startDate: string, endDate: string } }): boolean => {
    const saleDate = new Date(date.split('T')[0]).valueOf()
    const startDate = new Date(dateFilter.startDate).valueOf()
    const endDate = new Date(dateFilter.endDate).valueOf()

    return saleDate >= startDate && saleDate <= endDate
}

export const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length < 1) return ''
    if (cleaned.length < 4) return cleaned
    if (cleaned.length < 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
}

export const validatePhoneFormat = (phone: string): string | null => {
    const cleaned = phone.replace(/\D/g, '')
    if (!cleaned) return 'Phone number is required'
    if (cleaned.length !== 10) return 'Phone number must be 10 digits in length'
    if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) return 'Phone number must be in xxx-xxx-xxxx format'
    return null
}