import { useState, useEffect } from 'react'
import { Salesperson } from "../../types"
import Modal from "../shared/Modal"
import { formatPhoneNumber } from "../shared/helpers"
import { validateSalesperson, SalespersonValidationErrors } from "../shared/validation"
import {
    FormField,
    FormLabel,
    Input,
    ErrorMessage,
    ButtonContainer,
    Button,
} from '../shared/styles'

type SalespersonFormData = Omit<Salesperson, 'id'> & { id?: number }

type SalespersonsModalProps = {
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
    salesperson?: Salesperson | null
    handleSave: (salesperson: SalespersonFormData) => void
    isEditMode: boolean
    existingSalespersons: Salesperson[]
}

const defaultSalesperson: SalespersonFormData = {
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    terminationDate: null,
    manager: ''
}

export const SalespersonsModal = ({
    isModalOpen,
    setIsModalOpen,
    salesperson,
    handleSave,
    isEditMode,
    existingSalespersons
}: SalespersonsModalProps) => {
    const [formData, setFormData] = useState<SalespersonFormData>(defaultSalesperson)
    const [errors, setErrors] = useState<SalespersonValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (salesperson) {
            setFormData({
                ...salesperson,
                startDate: salesperson.startDate.split('T')[0],
                terminationDate: salesperson.terminationDate ? salesperson.terminationDate.split('T')[0] : null
            })
        } else {
            setFormData(defaultSalesperson)
        }
        setErrors({})
    }, [salesperson, isModalOpen])

    const validateForm = (): boolean => {
        const result = validateSalesperson(formData, existingSalespersons, isEditMode ? salesperson?.id : undefined)
        setErrors(result.errors)
        return result.isValid
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
                        hasError={Boolean(errors.firstName) || Boolean(errors.duplicateName)}
                        type="text"
                        value={formData.firstName}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, firstName: e.target.value }))
                            if (errors.firstName) {
                                setErrors(prev => ({ ...prev, firstName: undefined }))
                            }
                            if (errors.duplicateName) {
                                setErrors(prev => ({ ...prev, duplicateName: undefined }))
                            }
                        }}
                    />
                    {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
                    {errors.duplicateName && <ErrorMessage>{errors.duplicateName}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Last Name *</FormLabel>
                    <Input
                        hasError={Boolean(errors.lastName) || Boolean(errors.duplicateName)}
                        type="text"
                        value={formData.lastName}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, lastName: e.target.value }))
                            if (errors.lastName) {
                                setErrors(prev => ({ ...prev, lastName: undefined }))
                            }
                            if (errors.duplicateName) {
                                setErrors(prev => ({ ...prev, duplicateName: undefined }))
                            }
                        }}
                    />
                    {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
                    {errors.duplicateName && <ErrorMessage>{errors.duplicateName}</ErrorMessage>}

                </FormField>

                <FormField>
                    <FormLabel>Phone *</FormLabel>
                    <Input
                        hasError={Boolean(errors.phone)}
                        type="tel"
                        value={formData.phone}
                        onChange={e => {
                            const formattedNumber = formatPhoneNumber(e.target.value)
                            setFormData(prev => ({ ...prev, phone: formattedNumber }))
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
                        hasError={Boolean(errors.address)}
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
                        hasError={Boolean(errors.startDate)}
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
                        hasError={Boolean(errors.terminationDate)}
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
                        hasError={Boolean(errors.manager)}
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
                        disabled={isSubmitting || Boolean(errors.duplicateName)}
                        variant='primary'
                    >
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add Salesperson')}
                    </Button>
                </ButtonContainer>
            </div>
        </Modal>
    )
}
