import React from 'react'
import Modal from './Modal'

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    itemName: string
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Delete',
    itemName,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            title={title}
            message={`Are you sure you want to delete ${itemName}?`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            showConfirmButton={true}
            onConfirm={onConfirm}
        />
    )
}

export default DeleteConfirmationModal
