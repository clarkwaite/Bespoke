import { useState, useEffect } from 'react';
import { Product } from "../../types";
import { formStyles } from "../shared/styles";
import Modal from "../shared/Modal"

type ValidationErrors = {
    name?: string;
    manufacturer?: string;
    style?: string;
    purchasePrice?: string;
    salePrice?: string;
    qtyOnHand?: string;
    commissionPercentage?: string;
    duplicateProduct?: string;
};

type ProductFormData = Omit<Product, 'id'> & { id?: number };

type ProductsModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    product?: Product | null;
    handleSave: (product: ProductFormData) => void;
    isEditMode: boolean;
    existingProducts: Product[];
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
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                name: '',
                manufacturer: '',
                style: '',
                purchasePrice: 0,
                salePrice: 0,
                qtyOnHand: 0,
                commissionPercentage: 0
            });
        }
        setErrors({});
    }, [product, isModalOpen]);

    const checkForDuplicates = (data: ProductFormData) => {
        const duplicate = existingProducts.find(p =>
            p.id !== (isEditMode ? product?.id : undefined) && // Skip current product when editing
            p.name.toLowerCase() === data.name.toLowerCase() &&
            p.manufacturer.toLowerCase() === data.manufacturer.toLowerCase()
        );

        return duplicate ? 'A product with this name and manufacturer already exists' : null;
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Manufacturer validation
        if (!formData.manufacturer.trim()) {
            newErrors.manufacturer = 'Manufacturer is required';
        }

        // Style validation
        if (!formData.style.trim()) {
            newErrors.style = 'Style is required';
        }

        // Purchase Price validation
        if (formData.purchasePrice <= 0) {
            newErrors.purchasePrice = 'Purchase price must be greater than 0';
        }

        // Sale Price validation
        if (formData.salePrice <= 0) {
            newErrors.salePrice = 'Sale price must be greater than 0';
        } else if (formData.salePrice <= formData.purchasePrice) {
            newErrors.salePrice = 'Sale price must be greater than purchase price';
        }

        // Quantity validation
        if (formData.qtyOnHand < 0) {
            newErrors.qtyOnHand = 'Quantity cannot be negative';
        }

        // Commission Percentage validation
        if (formData.commissionPercentage < 0) {
            newErrors.commissionPercentage = 'Commission percentage cannot be negative';
        } else if (formData.commissionPercentage > 100) {
            newErrors.commissionPercentage = 'Commission percentage cannot exceed 100%';
        }

        // Check for duplicates
        if (formData.name && formData.manufacturer) {
            const duplicateError = checkForDuplicates(formData);
            if (duplicateError) {
                newErrors.duplicateProduct = duplicateError;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            handleSave({
                ...formData,
                id: isEditMode ? product?.id : undefined
            });
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Product" : "Add New Product"}
            showConfirmButton={false}
        >
            <div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Name *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.name || errors.duplicateProduct ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.name}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, name: e.target.value }));
                            if (errors.name) {
                                setErrors(prev => ({ ...prev, name: undefined, duplicateProduct: undefined }));
                            } else if (errors.duplicateProduct) {
                                setErrors(prev => ({ ...prev, duplicateProduct: undefined }));
                            }
                        }}
                    />
                    {errors.name && <div style={formStyles.error}>{errors.name}</div>}
                    {errors.duplicateProduct && <div style={formStyles.error}>{errors.duplicateProduct}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Manufacturer *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.manufacturer || errors.duplicateProduct ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.manufacturer}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, manufacturer: e.target.value }));
                            if (errors.manufacturer) {
                                setErrors(prev => ({ ...prev, manufacturer: undefined, duplicateProduct: undefined }));
                            } else if (errors.duplicateProduct) {
                                setErrors(prev => ({ ...prev, duplicateProduct: undefined }));
                            }
                        }}
                    />
                    {errors.manufacturer && <div style={formStyles.error}>{errors.manufacturer}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Style *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.style ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.style}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, style: e.target.value }));
                            if (errors.style) {
                                setErrors(prev => ({ ...prev, style: undefined }));
                            }
                        }}
                    />
                    {errors.style && <div style={formStyles.error}>{errors.style}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Purchase Price ($) *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.purchasePrice ? formStyles.errorBorder : {})
                        }}
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) }));
                            if (errors.purchasePrice) {
                                setErrors(prev => ({ ...prev, purchasePrice: undefined }));
                            }
                        }}
                    />
                    {errors.purchasePrice && <div style={formStyles.error}>{errors.purchasePrice}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Sale Price ($) *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.salePrice ? formStyles.errorBorder : {})
                        }}
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) }));
                            if (errors.salePrice) {
                                setErrors(prev => ({ ...prev, salePrice: undefined }));
                            }
                        }}
                    />
                    {errors.salePrice && <div style={formStyles.error}>{errors.salePrice}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Quantity on Hand *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.qtyOnHand ? formStyles.errorBorder : {})
                        }}
                        type="number"
                        min="0"
                        value={formData.qtyOnHand}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, qtyOnHand: parseInt(e.target.value) }));
                            if (errors.qtyOnHand) {
                                setErrors(prev => ({ ...prev, qtyOnHand: undefined }));
                            }
                        }}
                    />
                    {errors.qtyOnHand && <div style={formStyles.error}>{errors.qtyOnHand}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Commission Percentage (%) *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.commissionPercentage ? formStyles.errorBorder : {})
                        }}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.commissionPercentage}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, commissionPercentage: parseFloat(e.target.value) }));
                            if (errors.commissionPercentage) {
                                setErrors(prev => ({ ...prev, commissionPercentage: undefined }));
                            }
                        }}
                    />
                    {errors.commissionPercentage && <div style={formStyles.error}>{errors.commissionPercentage}</div>}
                </div>

                <div style={formStyles.buttonContainer}>
                    <button
                        style={{ ...formStyles.button, ...formStyles.cancelButton }}
                        onClick={() => setIsModalOpen(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        style={{ ...formStyles.button, ...formStyles.saveButton }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
