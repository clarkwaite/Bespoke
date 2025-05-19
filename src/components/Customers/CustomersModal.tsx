import { useState, useEffect } from 'react';
import { Customer } from "../../types";
import { formStyles } from "../shared/formStyles";
import Modal from "../shared/Modal"

type ValidationErrors = {
    firstName?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    startDate?: string;
};

type CustomerFormData = Omit<Customer, 'id'> & { id?: number };

type CustomersModalType = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    customer?: Customer | null;
    handleSave: (customer: CustomerFormData) => void;
    isEditMode: boolean;
}

export const CustomersModal = ({ isModalOpen, setIsModalOpen, customer, handleSave, isEditMode }: CustomersModalType) => {
    const [formData, setFormData] = useState<CustomerFormData>({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                ...customer,
                startDate: customer.startDate.split('T')[0]
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                address: '',
                phone: '',
                startDate: new Date().toISOString().split('T')[0]
            });
        }
        setErrors({});
    }, [customer, isModalOpen]);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!/^\+?[\d\s-]+$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format';
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            handleSave({
                ...formData,
                id: isEditMode ? customer?.id : undefined
            });
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Customer" : "Add New Customer"}
            showConfirmButton={false}
        >
            <div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>First Name *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.firstName ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.firstName}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, firstName: e.target.value }));
                            if (errors.firstName) {
                                setErrors(prev => ({ ...prev, firstName: undefined }));
                            }
                        }}
                    />
                    {errors.firstName && <div style={formStyles.error}>{errors.firstName}</div>}
                </div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Last Name *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.lastName ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.lastName}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, lastName: e.target.value }));
                            if (errors.lastName) {
                                setErrors(prev => ({ ...prev, lastName: undefined }));
                            }
                        }}
                    />
                    {errors.lastName && <div style={formStyles.error}>{errors.lastName}</div>}
                </div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Address *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.address ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.address}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, address: e.target.value }));
                            if (errors.address) {
                                setErrors(prev => ({ ...prev, address: undefined }));
                            }
                        }}
                    />
                    {errors.address && <div style={formStyles.error}>{errors.address}</div>}
                </div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Phone *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.phone ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.phone}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, phone: e.target.value }));
                            if (errors.phone) {
                                setErrors(prev => ({ ...prev, phone: undefined }));
                            }
                        }}
                        placeholder="+1 234-567-8900"
                    />
                    {errors.phone && <div style={formStyles.error}>{errors.phone}</div>}
                </div>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Start Date *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.startDate ? formStyles.errorBorder : {})
                        }}
                        type="date"
                        value={formData.startDate}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, startDate: e.target.value }));
                            if (errors.startDate) {
                                setErrors(prev => ({ ...prev, startDate: undefined }));
                            }
                        }}
                    />
                    {errors.startDate && <div style={formStyles.error}>{errors.startDate}</div>}
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
}