export const formStyles = {
    field: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold' as const,
    },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    datePicker: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    dateApplyButton: {
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
        marginTop: '8px',
        backgroundColor: '#007bff',
        color: 'white'
    },
       disabledButton: {
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
        marginTop: '8px',
        backgroundColor: 'gray',
        color: 'white'
    },
    select: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px',
    },
    button: {
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
    },
    saveButton: {
        backgroundColor: '#007bff',
        color: 'white',
    },
    deleteButton: {
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: '#dc3545',
        color: 'white',
    },
    filterContainer: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        color: 'white',
        marginRight: '10px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
    },
    th: { padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' as const },
    td: { padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'left' as const },
    error: { color: 'red', fontSize: '12px' },
    errorBorder: { borderColor: 'red' }
};
