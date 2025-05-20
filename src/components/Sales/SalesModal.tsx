import { useState, useEffect } from 'react';
import { formStyles } from "../shared/styles";
import Modal from "../shared/Modal";
import { SaleFormData } from './types';

type ValidationErrors = {
    productId?: string;
    salesPersonId?: string;
    customerId?: string;
    date?: string;
};

type SaleModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    handleSave: (sale: SaleFormData) => void;
    isEditMode: boolean;
    products: {
        id: number;
        name: string;
        salePrice: number;
    }[];
    salespersons: {
        id: number;
        firstName: string;
        lastName: string;
    }[];
    customers: {
        id: number;
        firstName: string;
        lastName: string;
    }[];
}

export const SalesModal = ({
    isModalOpen,
    setIsModalOpen,
    handleSave,
    isEditMode,
    products,
    salespersons,
    customers
}: SaleModalProps) => {
    const [formData, setFormData] = useState<SaleFormData>({
        productId: 0,
        salesPersonId: 0,
        customerId: 0,
        date: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            productId: 0,
            salesPersonId: 0,
            customerId: 0,
            date: new Date().toISOString().split('T')[0]
        });
        setErrors({});
    }, [isModalOpen]);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.productId) {
            newErrors.productId = 'Product selection is required';
        }

        if (!formData.salesPersonId) {
            newErrors.salesPersonId = 'Salesperson selection is required';
        }

        if (!formData.customerId) {
            newErrors.customerId = 'Customer selection is required';
        }

        if (!formData.date) {
            newErrors.date = 'Sale date is required';
        } else {
            const saleDate = new Date(formData.date);
            const today = new Date();
            if (saleDate > today) {
                newErrors.date = 'Sale date cannot be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            handleSave(formData);
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Sale" : "Create New Sale"}
            showConfirmButton={false}
        >
            <div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Product *</label>
                    <select
                        style={{
                            ...formStyles.select,
                            ...(errors.productId ? formStyles.errorBorder : {})
                        }}
                        value={formData.productId || ''}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, productId: parseInt(e.target.value) }));
                            if (errors.productId) {
                                setErrors(prev => ({ ...prev, productId: undefined }));
                            }
                        }}
                    >
                        <option value="">Select a product</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name} - ${product.salePrice}
                            </option>
                        ))}
                    </select>
                    {errors.productId && <div style={formStyles.error}>{errors.productId}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Salesperson *</label>
                    <select
                        style={{
                            ...formStyles.select,
                            ...(errors.salesPersonId ? formStyles.errorBorder : {})
                        }}
                        value={formData.salesPersonId || ''}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, salesPersonId: parseInt(e.target.value) }));
                            if (errors.salesPersonId) {
                                setErrors(prev => ({ ...prev, salesPersonId: undefined }));
                            }
                        }}
                    >
                        <option value="">Select a salesperson</option>
                        {salespersons.map(salesperson => (
                            <option key={salesperson.id} value={salesperson.id}>
                                {salesperson.firstName} {salesperson.lastName}
                            </option>
                        ))}
                    </select>
                    {errors.salesPersonId && <div style={formStyles.error}>{errors.salesPersonId}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Customer *</label>
                    <select
                        style={{
                            ...formStyles.select,
                            ...(errors.customerId ? formStyles.errorBorder : {})
                        }}
                        value={formData.customerId || ''}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, customerId: parseInt(e.target.value) }));
                            if (errors.customerId) {
                                setErrors(prev => ({ ...prev, customerId: undefined }));
                            }
                        }}
                    >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName}
                            </option>
                        ))}
                    </select>
                    {errors.customerId && <div style={formStyles.error}>{errors.customerId}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Sale Date *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.date ? formStyles.errorBorder : {})
                        }}
                        type="date"
                        value={formData.date}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, date: e.target.value }));
                            if (errors.date) {
                                setErrors(prev => ({ ...prev, date: undefined }));
                            }
                        }}
                    />
                    {errors.date && <div style={formStyles.error}>{errors.date}</div>}
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
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create Sale')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};