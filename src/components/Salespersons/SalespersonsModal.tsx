import { useState, useEffect } from 'react'
import { Salesperson } from "../../types"
import Modal from "../shared/Modal"
import {
    FormField,
    FormLabel,
    Input,
    ErrorMessage,
    ButtonContainer,
    Button,
} from '../shared/styles'

type ValidationErrors = {
    firstName?: string
    lastName?: string
    address?: string
    phone?: string
    startDate?: string
    terminationDate?: string
    manager?: string
    duplicateName?: string
}

type SalespersonFormData = Omit<Salesperson, 'id'> & { id?: number }

type SalespersonsModalProps = {
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
    salesperson?: Salesperson | null
    handleSave: (salesperson: SalespersonFormData) => void
    isEditMode: boolean
    existingSalespersons: Salesperson[]
}

export const SalespersonsModal = ({
    isModalOpen,
    setIsModalOpen,
    salesperson,
    handleSave,
    isEditMode,
    existingSalespersons
}: SalespersonsModalProps) => {
    const [formData, setFormData] = useState<SalespersonFormData>({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0],
        terminationDate: null,
        manager: ''
    })
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (salesperson) {
            setFormData({
                ...salesperson,
                startDate: salesperson.startDate.split('T')[0],
                terminationDate: salesperson.terminationDate ? salesperson.terminationDate.split('T')[0] : null
            })
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                address: '',
                phone: '',
                startDate: new Date().toISOString().split('T')[0],
                terminationDate: null,
                manager: ''
            })
        }
        setErrors({})
    }, [salesperson, isModalOpen])

    const checkForDuplicates = (data: SalespersonFormData) => {
        const phoneDuplicate = existingSalespersons.find(sp =>
        (
            sp.id !== (isEditMode ? salesperson?.id : undefined) &&
            sp.phone === data.phone
        )
        )

        const nameDuplicate = existingSalespersons.find(sp =>
        (
            sp.id !== (isEditMode ? salesperson?.id : undefined) &&
            sp.firstName === data.firstName &&
            sp.lastName === data.lastName
        )
        )

        return {
            phone: phoneDuplicate ? 'Phone number already exists' : null,
            name: nameDuplicate ? 'Salesperson with this first and last name already exists' : null
        }
    }

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required'
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters'
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required'
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required'
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits in length'
        }

        if (formData.firstName && formData.lastName && formData.phone) {
            const duplicateError = checkForDuplicates(formData)
            if (duplicateError) {
                if (duplicateError.name) {
                    newErrors.duplicateName = duplicateError.name
                }
                if (duplicateError.phone) {
                    newErrors.phone = duplicateError.phone
                }
            }
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required'
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required'
        } else {
            const startDate = new Date(formData.startDate)
            const today = new Date()
            if (startDate > today) {
                newErrors.startDate = 'Start date cannot be in the future'
            }
        }

        if (formData.terminationDate) {
            const startDate = new Date(formData.startDate)
            const termDate = new Date(formData.terminationDate)

            if (termDate < startDate) {
                newErrors.terminationDate = 'Termination date cannot be before start date'
            }
            if (termDate > new Date()) {
                newErrors.terminationDate = 'Termination date cannot be in the future'
            }
        }

        if (!formData.manager.trim()) {
            newErrors.manager = 'Manager name is required'
        } else if (formData.manager.length < 2) {
            newErrors.manager = 'Manager name must be at least 2 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true)
            handleSave({
                ...formData,
                id: isEditMode ? salesperson?.id : undefined
            })
            setIsSubmitting(false)
            setIsModalOpen(false)
        }
    }

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Salesperson" : "Add New Salesperson"}
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
                            setFormData(prev => ({ ...prev, phone: e.target.value }))
                            if (errors.phone) {
                                setErrors(prev => ({ ...prev, phone: undefined }))
                            }
                        }}
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

                <FormField>
                    <FormLabel>Termination Date</FormLabel>
                    <Input
                        hasError={!!errors.terminationDate}
                        type="date"
                        value={formData.terminationDate || ''}
                        min={formData.startDate}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, terminationDate: e.target.value || null }))
                            if (errors.terminationDate) {
                                setErrors(prev => ({ ...prev, terminationDate: undefined }))
                            }
                        }}
                    />
                    {errors.terminationDate && <ErrorMessage>{errors.terminationDate}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Manager Name *</FormLabel>
                    <Input
                        hasError={!!errors.manager}
                        type="text"
                        value={formData.manager}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, manager: e.target.value }))
                            if (errors.manager) {
                                setErrors(prev => ({ ...prev, manager: undefined }))
                            }
                        }}
                    />
                    {errors.manager && <ErrorMessage>{errors.manager}</ErrorMessage>}
                </FormField>

                {errors.duplicateName && (
                    <ErrorMessage>{errors.duplicateName}</ErrorMessage>
                )}

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
                        disabled={isSubmitting || !!errors.duplicateName}
                        variant='primary'
                    >
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add Salesperson')}
                    </Button>
                </ButtonContainer>
            </div>
        </Modal>
    )
}
