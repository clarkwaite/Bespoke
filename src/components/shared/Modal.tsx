import React from 'react'
import ReactModal from 'react-modal'
import {
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalActions,
} from './modalStyles'
import { Button } from './styles'

ReactModal.setAppElement('#root')

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
}

interface ModalProps {
  isOpen: boolean
  onRequestClose: () => void
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  children?: React.ReactNode
  showConfirmButton?: boolean
  onConfirm?: () => void
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  children,
  showConfirmButton = true,
  onConfirm
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel={title}
    >
      <div>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {!showConfirmButton && (
            <CloseButton onClick={onRequestClose}>×</CloseButton>
          )}
        </ModalHeader>
        {message && <p>{message}</p>}
        {children}
        {showConfirmButton && (
          <ModalActions>
            <Button variant='danger' onClick={onRequestClose}>
              {cancelLabel}
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                if (onConfirm) {
                  onConfirm()
                }
                onRequestClose()
              }}
            >
              {confirmLabel}
            </Button>
          </ModalActions>
        )}
      </div>
    </ReactModal>
  )
}

export default Modal
