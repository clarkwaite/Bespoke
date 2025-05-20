import { useState, useEffect } from 'react'
import Modal from "../shared/Modal"
import { SaleFormData } from './types'
import { useQuery } from '@tanstack/react-query'
import { CUSTOMERS_QUERY_KEY, PRODUCTS_QUERY_KEY, SALESPERSONS_QUERY_KEY } from '../shared/constants'
import { Customer, Product, Salesperson } from '../../types'
import {
    FormField,
    FormLabel,
    Select,
    Input,
    ErrorMessage,
    ButtonContainer,
    Button,
} from '../shared/styles'

type ValidationErrors = {
    productId?: string
    salesPersonId?: string
    customerId?: string
    date?: string
}

type SaleModalProps = {
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
    handleSave: (sale: SaleFormData) => void
    isEditMode: boolean
}

export const SalesModal = ({
    isModalOpen,
    setIsModalOpen,
    handleSave,
    isEditMode,
}: SaleModalProps) => {
    const [formData, setFormData] = useState<SaleFormData>({
        productId: 0,
        salesPersonId: 0,
        customerId: 0,
        date: new Date().toISOString().split('T')[0]
    })
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: products = [] } = useQuery({
        queryKey: PRODUCTS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/products')
            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            return response.json() as Promise<Product[]>
        }
    })

    const { data: salespersons = [] } = useQuery({
        queryKey: SALESPERSONS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/salespersons')
            if (!response.ok) {
                throw new Error('Failed to fetch salespersons')
            }
            return response.json() as Promise<Salesperson[]>
        }
    })

    const { data: customers = [] } = useQuery({
        queryKey: CUSTOMERS_QUERY_KEY,
        queryFn: async () => {
            const response = await fetch('/api/customers')
            if (!response.ok) {
                throw new Error('Failed to fetch customers')
            }
            return response.json() as Promise<Customer[]>
        }
    })

    useEffect(() => {
        setFormData({
            productId: 0,
            salesPersonId: 0,
            customerId: 0,
            date: new Date().toISOString().split('T')[0]
        })
        setErrors({})
    }, [isModalOpen])

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        if (!formData.productId) {
            newErrors.productId = 'Product selection is required'
        }

        if (!formData.salesPersonId) {
            newErrors.salesPersonId = 'Salesperson selection is required'
        }

        if (!formData.customerId) {
            newErrors.customerId = 'Customer selection is required'
        }

        if (!formData.date) {
            newErrors.date = 'Sale date is required'
        } else {
            const saleDate = new Date(formData.date)
            const today = new Date()
            if (saleDate > today) {
                newErrors.date = 'Sale date cannot be in the future'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true)
            handleSave(formData)
            setIsSubmitting(false)
            setIsModalOpen(false)
        }
    }

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Sale" : "Create New Sale"}
            showConfirmButton={false}
        >
            <div>
                <FormField>
                    <FormLabel>Product *</FormLabel>
                    <Select
                        hasError={!!errors.productId}
                        value={formData.productId || ''}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, productId: parseInt(e.target.value) }))
                            if (errors.productId) {
                                setErrors(prev => ({ ...prev, productId: undefined }))
                            }
                        }}
                    >
                        <option value="">Select a product</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name} - ${product.salePrice}
                            </option>
                        ))}
                    </Select>
                    {errors.productId && <ErrorMessage>{errors.productId}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Salesperson *</FormLabel>
                    <Select
                        hasError={!!errors.salesPersonId}
                        value={formData.salesPersonId || ''}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, salesPersonId: parseInt(e.target.value) }))
                            if (errors.salesPersonId) {
                                setErrors(prev => ({ ...prev, salesPersonId: undefined }))
                            }
                        }}
                    >
                        <option value="">Select a salesperson</option>
                        {salespersons.map(salesperson => (
                            <option key={salesperson.id} value={salesperson.id}>
                                {salesperson.firstName} {salesperson.lastName}
                            </option>
                        ))}
                    </Select>
                    {errors.salesPersonId && <ErrorMessage>{errors.salesPersonId}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Customer *</FormLabel>
                    <Select
                        hasError={!!errors.customerId}
                        value={formData.customerId || ''}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, customerId: parseInt(e.target.value) }))
                            if (errors.customerId) {
                                setErrors(prev => ({ ...prev, customerId: undefined }))
                            }
                        }}
                    >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName}
                            </option>
                        ))}
                    </Select>
                    {errors.customerId && <ErrorMessage>{errors.customerId}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Sale Date *</FormLabel>
                    <Input
                        hasError={!!errors.date}
                        type="date"
                        value={formData.date}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, date: e.target.value }))
                            if (errors.date) {
                                setErrors(prev => ({ ...prev, date: undefined }))
                            }
                        }}
                    />
                    {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
                </FormField>

                <ButtonContainer>
                    <Button
                        onClick={() => setIsModalOpen(false)}
                        disabled={isSubmitting}
                        variant='danger'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        variant='primary'
                    >
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create Sale')}
                    </Button>
                </ButtonContainer>
            </div>
        </Modal>
    )
}