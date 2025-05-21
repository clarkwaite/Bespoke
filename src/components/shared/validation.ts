import { Customer, Product, Salesperson } from "../../types"

type ValidationResult<T> = {
    isValid: boolean
    errors: T
}

export type CommonValidationErrors = {
    firstName?: string
    lastName?: string
    address?: string
    phone?: string
    startDate?: string
}

export const validatePhoneFormat = (phone: string): string | null => {
    const cleaned = phone.replace(/\D/g, '')
    if (!cleaned) return 'Phone number is required'
    if (cleaned.length !== 10) return 'Phone number must be 10 digits in length'
    if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) return 'Phone number must be in xxx-xxx-xxxx format'
    return null
}

// Customer validation
export type CustomerValidationErrors = CommonValidationErrors

export const validateCustomer = (data: Omit<Customer, 'id'>): ValidationResult<CustomerValidationErrors> => {
    const errors: CustomerValidationErrors = {}

    if (!data.firstName.trim()) {
        errors.firstName = 'First name is required'
    }

    if (!data.lastName.trim()) {
        errors.lastName = 'Last name is required'
    }

    const phoneError = validatePhoneFormat(data.phone)
    if (phoneError) {
        errors.phone = phoneError
    }

    if (!data.address.trim()) {
        errors.address = 'Address is required'
    }

    if (!data.startDate) {
        errors.startDate = 'Start date is required'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

// Salesperson validation
export type SalespersonValidationErrors = CommonValidationErrors & {
    terminationDate?: string
    manager?: string
    duplicateName?: string
}

export const validateSalesperson = (
    data: Omit<Salesperson, 'id'>,
    existingSalespersons: Salesperson[],
    currentId?: number
): ValidationResult<SalespersonValidationErrors> => {
    const errors: SalespersonValidationErrors = {}

    if (!data.firstName.trim()) {
        errors.firstName = 'First name is required'
    } else if (data.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters'
    }

    if (!data.lastName.trim()) {
        errors.lastName = 'Last name is required'
    } else if (data.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters'
    }

    const phoneError = validatePhoneFormat(data.phone)
    if (phoneError) {
        errors.phone = phoneError
    }

    if (data.firstName && data.lastName && data.phone) {
        const phoneDuplicate = existingSalespersons.find(sp =>
            sp.id !== currentId &&
            sp.phone.replace(/\D/g, '') === data.phone.replace(/\D/g, '')
        )

        const nameDuplicate = existingSalespersons.find(sp =>
            sp.id !== currentId &&
            sp.firstName === data.firstName &&
            sp.lastName === data.lastName
        )

        if (phoneDuplicate) {
            errors.phone = 'Phone number already exists'
        }
        if (nameDuplicate) {
            errors.duplicateName = 'Salesperson with this first and last name already exists'
        }
    }

    if (!data.address.trim()) {
        errors.address = 'Address is required'
    }

    if (!data.startDate) {
        errors.startDate = 'Start date is required'
    } else {
        const startDate = new Date(data.startDate)
        const today = new Date()
        if (startDate > today) {
            errors.startDate = 'Start date cannot be in the future'
        }
    }

    if (data.terminationDate) {
        const startDate = new Date(data.startDate)
        const termDate = new Date(data.terminationDate)

        if (termDate < startDate) {
            errors.terminationDate = 'Termination date cannot be before start date'
        }
        if (termDate > new Date()) {
            errors.terminationDate = 'Termination date cannot be in the future'
        }
    }

    if (!data.manager.trim()) {
        errors.manager = 'Manager name is required'
    } else if (data.manager.length < 2) {
        errors.manager = 'Manager name must be at least 2 characters'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

// Product validation
export type ProductValidationErrors = {
    name?: string
    manufacturer?: string
    style?: string
    purchasePrice?: string
    salePrice?: string
    qtyOnHand?: string
    commissionPercentage?: string
    duplicateProduct?: string
}

export const validateProduct = (
    data: Omit<Product, 'id'>,
    existingProducts: Product[],
    currentId?: number
): ValidationResult<ProductValidationErrors> => {
    const errors: ProductValidationErrors = {}

    if (!data.name.trim()) {
        errors.name = 'Name is required'
    }

    if (!data.manufacturer.trim()) {
        errors.manufacturer = 'Manufacturer is required'
    }

    if (!data.style.trim()) {
        errors.style = 'Style is required'
    }

    if (data.purchasePrice <= 0) {
        errors.purchasePrice = 'Purchase price must be greater than 0'
    }

    if (data.salePrice <= 0) {
        errors.salePrice = 'Sale price must be greater than 0'
    } else if (data.salePrice <= data.purchasePrice) {
        errors.salePrice = 'Sale price must be greater than purchase price'
    }

    if (data.qtyOnHand < 0) {
        errors.qtyOnHand = 'Quantity cannot be negative'
    }

    if (data.commissionPercentage < 0) {
        errors.commissionPercentage = 'Commission percentage cannot be negative'
    } else if (data.commissionPercentage > 100) {
        errors.commissionPercentage = 'Commission percentage cannot exceed 100%'
    }

    if (data.name && data.manufacturer) {
        const duplicate = existingProducts.find(p =>
            p.id !== currentId &&
            p.name.toLowerCase() === data.name.toLowerCase() &&
            p.manufacturer.toLowerCase() === data.manufacturer.toLowerCase()
        )

        if (duplicate) {
            errors.duplicateProduct = 'A product with this name and manufacturer already exists'
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

// Sale validation
export type SaleValidationErrors = {
    productId?: string
    salesPersonId?: string
    customerId?: string
    date?: string
}

export const validateSale = (data: { productId: number, salesPersonId: number, customerId: number, date: string }): ValidationResult<SaleValidationErrors> => {
    const errors: SaleValidationErrors = {}

    if (!data.productId) {
        errors.productId = 'Product selection is required'
    }

    if (!data.salesPersonId) {
        errors.salesPersonId = 'Salesperson selection is required'
    }

    if (!data.customerId) {
        errors.customerId = 'Customer selection is required'
    }

    if (!data.date) {
        errors.date = 'Sale date is required'
    } else {
        const saleDate = new Date(data.date)
        const today = new Date()
        if (saleDate > today) {
            errors.date = 'Sale date cannot be in the future'
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}
