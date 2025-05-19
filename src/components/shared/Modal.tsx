import React from 'react';
import ReactModal from 'react-modal';

// Bind modal to your appElement for accessibility
ReactModal.setAppElement('#root');

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
};

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  children?: React.ReactNode;
  showConfirmButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  title,
  message,
  confirmLabel = 'OK',
  children,
  showConfirmButton = true
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel={title}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button
            onClick={onRequestClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>
        {message && <p>{message}</p>}
        {children}
        {showConfirmButton && (
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button 
              onClick={onRequestClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </ReactModal>
  );
};

export default Modal;
