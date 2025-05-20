import { useState, useEffect } from 'react';
import { Salesperson } from "../../types";
import { formStyles } from "../shared/styles";
import Modal from "../shared/Modal"

type ValidationErrors = {
    firstName?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    startDate?: string;
    terminationDate?: string;
    manager?: string;
    duplicateName?: string;
};

type SalespersonFormData = Omit<Salesperson, 'id'> & { id?: number };

type SalespersonsModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    salesperson?: Salesperson | null;
    handleSave: (salesperson: SalespersonFormData) => void;
    isEditMode: boolean;
    existingSalespersons: Salesperson[];
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
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (salesperson) {
            setFormData({
                ...salesperson,
                startDate: salesperson.startDate.split('T')[0],
                terminationDate: salesperson.terminationDate ? salesperson.terminationDate.split('T')[0] : null
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                address: '',
                phone: '',
                startDate: new Date().toISOString().split('T')[0],
                terminationDate: null,
                manager: ''
            });
        }
        setErrors({});
    }, [salesperson, isModalOpen]);

    const checkForDuplicates = (data: SalespersonFormData) => {
        const phoneDuplicate = existingSalespersons.find(sp =>
        (
            sp.id !== (isEditMode ? salesperson?.id : undefined) && // Skip current salesperson when editing
            sp.phone === data.phone
        )
        );

        const nameDuplicate = existingSalespersons.find(sp =>
        (
            sp.id !== (isEditMode ? salesperson?.id : undefined) && // Skip current salesperson when editing
            sp.firstName === data.firstName &&
            sp.lastName === data.lastName
        )
        );

        return {
            phone: phoneDuplicate ? 'Phone number already exists' : null,
            name: nameDuplicate ? 'Salesperson with this first and last name already exists' : null
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Required field validations
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            newErrors.phone = 'Invalid phone number format. Must be at least 10 digits';
        }

        // Check for duplicates when all key fields are filled
        if (formData.firstName && formData.lastName && formData.phone) {
            const duplicateError = checkForDuplicates(formData);
            if (duplicateError) {
                if (duplicateError.name) {
                    console.log("dupe error", duplicateError.name);
                    newErrors.duplicateName = duplicateError.name;
                }
                if (duplicateError.phone) {
                    newErrors.phone = duplicateError.phone;
                }
            }
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        } else {
            const startDate = new Date(formData.startDate);
            const today = new Date();
            if (startDate > today) {
                newErrors.startDate = 'Start date cannot be in the future';
            }
        }

        // Termination date validation
        if (formData.terminationDate) {
            const startDate = new Date(formData.startDate);
            const termDate = new Date(formData.terminationDate);

            if (termDate < startDate) {
                newErrors.terminationDate = 'Termination date cannot be before start date';
            }
            if (termDate > new Date()) {
                newErrors.terminationDate = 'Termination date cannot be in the future';
            }
        }

        if (!formData.manager.trim()) {
            newErrors.manager = 'Manager name is required';
        } else if (formData.manager.length < 2) {
            newErrors.manager = 'Manager name must be at least 2 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setIsSubmitting(true);
            handleSave({
                ...formData,
                id: isEditMode ? salesperson?.id : undefined
            });
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Edit Salesperson" : "Add New Salesperson"}
            showConfirmButton={false}
        >
            <div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>First Name *</label>
                        <input
                            style={{
                                ...formStyles.input,
                                ...(errors.firstName || errors.duplicateName ? formStyles.errorBorder : {})
                            }}
                            type="text"
                            value={formData.firstName}
                            onChange={e => {
                                setFormData(prev => ({ ...prev, firstName: e.target.value }));
                                if (errors.firstName) {
                                    setErrors(prev => ({ ...prev, firstName: undefined, duplicateName: undefined }));
                                } else if (errors.duplicateName) {
                                    setErrors(prev => ({ ...prev, duplicateName: undefined }));
                                }
                            }}
                        />
                        {errors.firstName && <div style={formStyles.error}>{errors.firstName}</div>}
                        {errors.duplicateName && <div style={formStyles.error}>{errors.duplicateName}</div>}
                    </div>

                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Last Name *</label>
                        <input
                            style={{
                                ...formStyles.input,
                                ...(errors.lastName || errors.duplicateName ? formStyles.errorBorder : {})
                            }}
                            type="text"
                            value={formData.lastName}
                            onChange={e => {
                                setFormData(prev => ({ ...prev, lastName: e.target.value }));
                                if (errors.lastName) {
                                    setErrors(prev => ({ ...prev, lastName: undefined, duplicateName: undefined }));
                                } else if (errors.duplicateName) {
                                    setErrors(prev => ({ ...prev, duplicateName: undefined }));
                                }
                            }}
                        />
                        {errors.lastName && <div style={formStyles.error}>{errors.lastName}</div>}
                        {errors.duplicateName && <div style={formStyles.error}>{errors.duplicateName}</div>}
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

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Termination Date</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.terminationDate ? formStyles.errorBorder : {})
                        }}
                        type="date"
                        value={formData.terminationDate || ''}
                        min={formData.startDate}
                        onChange={e => {
                            setFormData(prev => ({
                                ...prev,
                                terminationDate: e.target.value || null
                            }));
                            if (errors.terminationDate) {
                                setErrors(prev => ({ ...prev, terminationDate: undefined }));
                            }
                        }}
                    />
                    {errors.terminationDate && <div style={formStyles.error}>{errors.terminationDate}</div>}
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Manager *</label>
                    <input
                        style={{
                            ...formStyles.input,
                            ...(errors.manager ? formStyles.errorBorder : {})
                        }}
                        type="text"
                        value={formData.manager}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, manager: e.target.value }));
                            if (errors.manager) {
                                setErrors(prev => ({ ...prev, manager: undefined }));
                            }
                        }}
                    />
                    {errors.manager && <div style={formStyles.error}>{errors.manager}</div>}
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
