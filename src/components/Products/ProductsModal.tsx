import { useState, useEffect } from 'react'
import { Product } from "../../types"
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
    name?: string
    manufacturer?: string
    style?: string
    purchasePrice?: string
    salePrice?: string
    qtyOnHand?: string
    commissionPercentage?: string
    duplicateProduct?: string
}

type ProductFormData = Omit<Product, 'id'> & { id?: number }

type ProductsModalProps = {
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
    product?: Product | null
    handleSave: (product: ProductFormData) => void
    isEditMode: boolean
    existingProducts: Product[]
}

export const ProductsModal = ({
    isModalOpen,
    setIsModalOpen,
    product,
    handleSave,
    isEditMode,
    existingProducts
}: ProductsModalProps) => {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        manufacturer: '',
        style: '',
        purchasePrice: 0,
        salePrice: 0,
        qtyOnHand: 0,
        commissionPercentage: 0
    })
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (product) {
            setFormData(product)
        } else {
            setFormData({
                name: '',
                manufacturer: '',
                style: '',
                purchasePrice: 0,
                salePrice: 0,
                qtyOnHand: 0,
                commissionPercentage: 0
            })
        }
        setErrors({})
    }, [product, isModalOpen])

    const checkForDuplicates = (data: ProductFormData) => {
        const duplicate = existingProducts.find(p =>
            p.id !== (isEditMode ? product?.id : undefined) &&
            p.name.toLowerCase() === data.name.toLowerCase() &&
            p.manufacturer.toLowerCase() === data.manufacturer.toLowerCase()
        )

        return duplicate ? 'A product with this name and manufacturer already exists' : null
    }

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!formData.manufacturer.trim()) {
            newErrors.manufacturer = 'Manufacturer is required'
        }

        if (!formData.style.trim()) {
            newErrors.style = 'Style is required'
        }

        if (formData.purchasePrice <= 0) {
            newErrors.purchasePrice = 'Purchase price must be greater than 0'
        }

        if (formData.salePrice <= 0) {
            newErrors.salePrice = 'Sale price must be greater than 0'
        } else if (formData.salePrice <= formData.purchasePrice) {
            newErrors.salePrice = 'Sale price must be greater than purchase price'
        }

        if (formData.qtyOnHand < 0) {
            newErrors.qtyOnHand = 'Quantity cannot be negative'
        }

        if (formData.commissionPercentage < 0) {
            newErrors.commissionPercentage = 'Commission percentage cannot be negative'
        } else if (formData.commissionPercentage > 100) {
            newErrors.commissionPercentage = 'Commission percentage cannot exceed 100%'
        }

        if (formData.name && formData.manufacturer) {
            const duplicateError = checkForDuplicates(formData)
            if (duplicateError) {
                newErrors.duplicateProduct = duplicateError
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true)
            handleSave({
                ...formData,
                id: isEditMode ? product?.id : undefined
            })
            setIsSubmitting(false)
            setIsModalOpen(false)
        }
    }

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Product" : "Add New Product"}
            showConfirmButton={false}
        >
            <div>
                <FormField>
                    <FormLabel>Name *</FormLabel>
                    <Input
                        hasError={!!errors.name}
                        type="text"
                        value={formData.name}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, name: e.target.value }))
                            if (errors.name) {
                                setErrors(prev => ({ ...prev, name: undefined }))
                            }
                            const duplicateError = checkForDuplicates({ ...formData, name: e.target.value })
                            if (duplicateError) {
                                setErrors(prev => ({ ...prev, duplicateProduct: duplicateError }))
                            } else {
                                setErrors(prev => ({ ...prev, duplicateProduct: undefined }))
                            }
                        }}
                    />
                    {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Manufacturer *</FormLabel>
                    <Input
                        hasError={!!errors.manufacturer}
                        type="text"
                        value={formData.manufacturer}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, manufacturer: e.target.value }))
                            if (errors.manufacturer) {
                                setErrors(prev => ({ ...prev, manufacturer: undefined }))
                            }
                            const duplicateError = checkForDuplicates({ ...formData, manufacturer: e.target.value })
                            if (duplicateError) {
                                setErrors(prev => ({ ...prev, duplicateProduct: duplicateError }))
                            } else {
                                setErrors(prev => ({ ...prev, duplicateProduct: undefined }))
                            }
                        }}
                    />
                    {errors.manufacturer && <ErrorMessage>{errors.manufacturer}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Style *</FormLabel>
                    <Input
                        hasError={!!errors.style}
                        type="text"
                        value={formData.style}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, style: e.target.value }))
                            if (errors.style) {
                                setErrors(prev => ({ ...prev, style: undefined }))
                            }
                        }}
                    />
                    {errors.style && <ErrorMessage>{errors.style}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Purchase Price *</FormLabel>
                    <Input
                        hasError={!!errors.purchasePrice}
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.purchasePrice}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))
                            if (errors.purchasePrice) {
                                setErrors(prev => ({ ...prev, purchasePrice: undefined }))
                            }
                        }}
                    />
                    {errors.purchasePrice && <ErrorMessage>{errors.purchasePrice}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Sale Price *</FormLabel>
                    <Input
                        hasError={!!errors.salePrice}
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.salePrice}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))
                            if (errors.salePrice) {
                                setErrors(prev => ({ ...prev, salePrice: undefined }))
                            }
                        }}
                    />
                    {errors.salePrice && <ErrorMessage>{errors.salePrice}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Quantity on Hand *</FormLabel>
                    <Input
                        hasError={!!errors.qtyOnHand}
                        type="number"
                        min="0"
                        value={formData.qtyOnHand}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, qtyOnHand: parseInt(e.target.value) || 0 }))
                            if (errors.qtyOnHand) {
                                setErrors(prev => ({ ...prev, qtyOnHand: undefined }))
                            }
                        }}
                    />
                    {errors.qtyOnHand && <ErrorMessage>{errors.qtyOnHand}</ErrorMessage>}
                </FormField>

                <FormField>
                    <FormLabel>Commission Percentage *</FormLabel>
                    <Input
                        hasError={!!errors.commissionPercentage}
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.commissionPercentage}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, commissionPercentage: parseFloat(e.target.value) || 0 }))
                            if (errors.commissionPercentage) {
                                setErrors(prev => ({ ...prev, commissionPercentage: undefined }))
                            }
                        }}
                    />
                    {errors.commissionPercentage && <ErrorMessage>{errors.commissionPercentage}</ErrorMessage>}
                </FormField>

                {errors.duplicateProduct && (
                    <ErrorMessage>{errors.duplicateProduct}</ErrorMessage>
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
                        disabled={isSubmitting || !!errors.duplicateProduct}
                        variant='primary'
                    >
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add Product')}
                    </Button>
                </ButtonContainer>
            </div>
        </Modal>
    )
}
