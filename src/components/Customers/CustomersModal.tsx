import { useState, useEffect } from 'react'
import { Customer } from "../../types"
import Modal from "../shared/Modal"
import { formatPhoneNumber } from "../shared/helpers"
import { validateCustomer, CustomerValidationErrors } from "../shared/validation"
import {
    FormField,
    FormLabel,
    Input,
    ErrorMessage,
    ButtonContainer,
    Button
} from '../shared/styles'

type CustomerFormData = Omit<Customer, 'id'> & { id?: number }

type CustomersModalType = {
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
    customer?: Customer | null
    handleSave: (customer: CustomerFormData) => void
    isEditMode: boolean
}

export const CustomersModal = ({ isModalOpen, setIsModalOpen, customer, handleSave, isEditMode }: CustomersModalType) => {
    const [formData, setFormData] = useState<CustomerFormData>({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0]
    })
    const [errors, setErrors] = useState<CustomerValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (customer) {
            setFormData({
                ...customer,
                startDate: customer.startDate.split('T')[0]
            })
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                address: '',
                phone: '',
                startDate: new Date().toISOString().split('T')[0]
            })
        }
        setErrors({})
    }, [customer, isModalOpen])

    const validateForm = (): boolean => {
        const result = validateCustomer(formData)
        setErrors(result.errors)
        return result.isValid
    }

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true)
            handleSave({
                ...formData,
                id: isEditMode ? customer?.id : undefined
            })
            setIsSubmitting(false)
            setIsModalOpen(false)
        }
    }

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Customer" : "Add New Customer"}
            showConfirmButton={false}
        >
            <div>
                <FormField>
                    <FormLabel>First Name *</FormLabel>
                    <Input
                        hasError={!!errors.firstName}
                        type="text"
                        value={formData.firstName}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, firstName: e.target.value }))
                            if (errors.firstName) {
                                setErrors(prev => ({ ...prev, firstName: undefined }))
                            }
                        }}
                    />
                    {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Last Name *</FormLabel>
                    <Input
                        hasError={!!errors.lastName}
                        type="text"
                        value={formData.lastName}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, lastName: e.target.value }))
                            if (errors.lastName) {
                                setErrors(prev => ({ ...prev, lastName: undefined }))
                            }
                        }}
                    />
                    {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Phone *</FormLabel>
                    <Input
                        hasError={!!errors.phone}
                        type="tel"
                        value={formData.phone}
                        onChange={e => {
                            const formatted = formatPhoneNumber(e.target.value)
                            setFormData(prev => ({ ...prev, phone: formatted }))
                            if (errors.phone) {
                                setErrors(prev => ({ ...prev, phone: undefined }))
                            }
                        }}
                        placeholder="123-345-5678"
                    />
                    {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Address *</FormLabel>
                    <Input
                        hasError={!!errors.address}
                        type="text"
                        value={formData.address}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, address: e.target.value }))
                            if (errors.address) {
                                setErrors(prev => ({ ...prev, address: undefined }))
                            }
                        }}
                    />
                    {errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Start Date *</FormLabel>
                    <Input
                        hasError={!!errors.startDate}
                        type="date"
                        value={formData.startDate}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, startDate: e.target.value }))
                            if (errors.startDate) {
                                setErrors(prev => ({ ...prev, startDate: undefined }))
                            }
                        }}
                    />
                    {errors.startDate && <ErrorMessage>{errors.startDate}</ErrorMessage>}
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
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add Customer')}
                    </Button>
                </ButtonContainer>
            </div>
        </Modal>
    )
}