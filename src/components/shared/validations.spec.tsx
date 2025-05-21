import { validateCustomer, validateSalesperson, validateProduct, validateSale } from './validation'
import { Customer, Product, Salesperson } from '../../types'

describe('Customer Validation', () => {
    const validCustomer: Omit<Customer, 'id'> = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '123-456-7890',
        address: '123 Main St',
        startDate: '2025-05-20'
    }

    test('should validate a valid customer', () => {
        const result = validateCustomer(validCustomer)
        expect(result.isValid).toBe(true)
        expect(result.errors).toEqual({})
    })

    test('should validate first name', () => {
        const result = validateCustomer({ ...validCustomer, firstName: '' })
        expect(result.isValid).toBe(false)
        expect(result.errors.firstName).toBe('First name is required')
    })

    test('should validate last name', () => {
        const result = validateCustomer({ ...validCustomer, lastName: '' })
        expect(result.isValid).toBe(false)
        expect(result.errors.lastName).toBe('Last name is required')
    })

    test('should validate phone format', () => {
        const result = validateCustomer({ ...validCustomer, phone: '1234567890' })
        expect(result.isValid).toBe(false)
        expect(result.errors.phone).toBe('Phone number must be in xxx-xxx-xxxx format')
    })

    test('should validate address', () => {
        const result = validateCustomer({ ...validCustomer, address: '' })
        expect(result.isValid).toBe(false)
        expect(result.errors.address).toBe('Address is required')
    })

    test('should validate start date', () => {
        const result = validateCustomer({ ...validCustomer, startDate: '' })
        expect(result.isValid).toBe(false)
        expect(result.errors.startDate).toBe('Start date is required')
    })
})

describe('Salesperson Validation', () => {
    const validSalesperson: Omit<Salesperson, 'id'> = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '123-456-7890',
        address: '123 Main St',
        startDate: '2025-05-20',
        terminationDate: null,
        manager: 'Jane Smith'
    }

    const existingSalespersons: Salesperson[] = [{
        id: 1,
        firstName: 'Existing',
        lastName: 'User',
        phone: '987-654-3210',
        address: '456 Oak St',
        startDate: '2025-01-01',
        terminationDate: null,
        manager: 'Jane Smith'
    }]

    test('should validate a valid salesperson', () => {
        const result = validateSalesperson(validSalesperson, [])
        expect(result.isValid).toBe(true)
        expect(result.errors).toEqual({})
    })

    test('should validate first name length', () => {
        const result = validateSalesperson({ ...validSalesperson, firstName: 'J' }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.firstName).toBe('First name must be at least 2 characters')
    })

    test('should validate last name length', () => {
        const result = validateSalesperson({ ...validSalesperson, lastName: 'D' }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.lastName).toBe('Last name must be at least 2 characters')
    })

    test('should validate manager name length', () => {
        const result = validateSalesperson({ ...validSalesperson, manager: 'J' }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.manager).toBe('Manager name must be at least 2 characters')
    })

    test('should validate duplicate phone number', () => {
        const result = validateSalesperson({ ...validSalesperson, phone: '987-654-3210' }, existingSalespersons)
        expect(result.isValid).toBe(false)
        expect(result.errors.phone).toBe('Phone number already exists')
    })

    test('should validate duplicate name', () => {
        const result = validateSalesperson({
            ...validSalesperson,
            firstName: 'Existing',
            lastName: 'User'
        }, existingSalespersons)
        expect(result.isValid).toBe(false)
        expect(result.errors.duplicateName).toBe('Salesperson with this first and last name already exists')
    })

    test('should validate termination date not before start date', () => {
        const result = validateSalesperson({
            ...validSalesperson,
            startDate: '2025-05-20',
            terminationDate: '2025-05-19'
        }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.terminationDate).toBe('Termination date cannot be before start date')
    })

    test('should validate future dates', () => {
        const futureDate = '2026-01-01'
        const result = validateSalesperson({
            ...validSalesperson,
            startDate: futureDate
        }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.startDate).toBe('Start date cannot be in the future')
    })
})

describe('Product Validation', () => {
    const validProduct: Omit<Product, 'id'> = {
        name: 'Test Product',
        manufacturer: 'Test Manufacturer',
        style: 'Test Style',
        purchasePrice: 100,
        salePrice: 150,
        qtyOnHand: 10,
        commissionPercentage: 10
    }

    const existingProducts: Product[] = [{
        id: 1,
        name: 'Existing Product',
        manufacturer: 'Existing Manufacturer',
        style: 'Test Style',
        purchasePrice: 100,
        salePrice: 150,
        qtyOnHand: 10,
        commissionPercentage: 10
    }]

    test('should validate a valid product', () => {
        const result = validateProduct(validProduct, [])
        expect(result.isValid).toBe(true)
        expect(result.errors).toEqual({})
    })

    test('should validate required fields', () => {
        const result = validateProduct({
            ...validProduct,
            name: '',
            manufacturer: '',
            style: ''
        }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.name).toBe('Name is required')
        expect(result.errors.manufacturer).toBe('Manufacturer is required')
        expect(result.errors.style).toBe('Style is required')
    })

    test('should validate prices', () => {
        const result = validateProduct({
            ...validProduct,
            purchasePrice: 0,
            salePrice: 0
        }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.purchasePrice).toBe('Purchase price must be greater than 0')
        expect(result.errors.salePrice).toBe('Sale price must be greater than 0')
    })

    test('should validate sale price greater than purchase price', () => {
        const result = validateProduct({
            ...validProduct,
            purchasePrice: 100,
            salePrice: 90
        }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.salePrice).toBe('Sale price must be greater than purchase price')
    })

    test('should validate commission percentage range', () => {
        const result = validateProduct({
            ...validProduct,
            commissionPercentage: 101
        }, [])
        expect(result.isValid).toBe(false)
        expect(result.errors.commissionPercentage).toBe('Commission percentage cannot exceed 100%')
    })

    test('should validate duplicate product', () => {
        const result = validateProduct({
            ...validProduct,
            name: 'Existing Product',
            manufacturer: 'Existing Manufacturer'
        }, existingProducts)
        expect(result.isValid).toBe(false)
        expect(result.errors.duplicateProduct).toBe('A product with this name and manufacturer already exists')
    })
})

describe('Sale Validation', () => {
    const validSale = {
        productId: 1,
        salesPersonId: 1,
        customerId: 1,
        date: '2025-05-20'
    }

    test('should validate a valid sale', () => {
        const result = validateSale(validSale)
        expect(result.isValid).toBe(true)
        expect(result.errors).toEqual({})
    })

    test('should validate required selections', () => {
        const result = validateSale({
            ...validSale,
            productId: 0,
            salesPersonId: 0,
            customerId: 0
        })
        expect(result.isValid).toBe(false)
        expect(result.errors.productId).toBe('Product selection is required')
        expect(result.errors.salesPersonId).toBe('Salesperson selection is required')
        expect(result.errors.customerId).toBe('Customer selection is required')
    })

    test('should validate sale date', () => {
        const result = validateSale({
            ...validSale,
            date: ''
        })
        expect(result.isValid).toBe(false)
        expect(result.errors.date).toBe('Sale date is required')
    })

    test('should validate future sale date', () => {
        const result = validateSale({
            ...validSale,
            date: '2026-01-01'
        })
        expect(result.isValid).toBe(false)
        expect(result.errors.date).toBe('Sale date cannot be in the future')
    })
})