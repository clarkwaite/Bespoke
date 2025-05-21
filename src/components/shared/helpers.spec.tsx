import { isBetweenTwoDates, formatPhoneNumber } from './helpers'

describe('shared helpers tests', () => {
    describe('isBetweenTwoDates', () => {
        it('should return true when date is between the two dates', () => {
            const date = '2024-10-01T00:00:00Z'
            const dateFilter = {
                startDate: '2024-09-01T00:00:00Z',
                endDate: '2024-10-31T00:00:00Z',
            }
            expect(isBetweenTwoDates({ date, dateFilter })).toBe(true)
        })
        it('should return false when date occurs after the end date', () => {
            const date = '2024-11-01T00:00:00Z'
            const dateFilter = {
                startDate: '2024-09-01T00:00:00Z',
                endDate: '2024-10-31T00:00:00Z',
            }
            expect(isBetweenTwoDates({ date, dateFilter })).toBe(false)
        })
        it('should return false when date occurs before the start date', () => {
            const date = '2024-08-01T00:00:00Z'
            const dateFilter = {
                startDate: '2024-09-01T00:00:00Z',
                endDate: '2024-10-31T00:00:00Z',
            }
            expect(isBetweenTwoDates({ date, dateFilter })).toBe(false)
        })
        it('should return true when date is on the start date', () => {
            const date = '2024-10-01T00:00:00Z'
            const dateFilter = {
                startDate: '2024-10-01T00:00:00Z',
                endDate: '2024-10-31T00:00:00Z',
            }
            expect(isBetweenTwoDates({ date, dateFilter })).toBe(true)
        })
        it('should return true when date is on the end date', () => {
            const date = '2024-10-31T00:00:00Z'
            const dateFilter = {
                startDate: '2024-10-01T00:00:00Z',
                endDate: '2024-10-31T00:00:00Z',
            }
            expect(isBetweenTwoDates({ date, dateFilter })).toBe(true)
        })
        it('should return true when date is the same as start and end date', () => {
            const date = '2024-10-01T00:00:00Z'
            const dateFilter = {
                startDate: '2024-10-01T00:00:00Z',
                endDate: '2024-10-01T00:00:00Z',
            }
            expect(isBetweenTwoDates({ date, dateFilter })).toBe(true)
        })
    })

    describe('formatPhoneNumber', () => {
        it('formats phone number correctly', () => {
            expect(formatPhoneNumber('1234567890')).toBe('123-456-7890')
            expect(formatPhoneNumber('123-456-7890')).toBe('123-456-7890')
            expect(formatPhoneNumber('123 456 7890')).toBe('123-456-7890')
            expect(formatPhoneNumber('123')).toBe('123')
            expect(formatPhoneNumber('')).toBe('')
        })
    })
})