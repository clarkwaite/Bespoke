import styled from 'styled-components';

const baseInputStyles = `
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
    
    &:focus {
        outline: none;
        border-color: #1a3040;
    }
`;

// Base styles that can be shared across components
const baseSpacing = `
    margin-bottom: 20px;
`;

const baseFlexContainer = `
    display: flex;
    gap: 20px;
`;

const baseTableCell = `
    padding: 12px;
    border-bottom: 1px solid #ddd;
    text-align: left;
`;

// Container Components
export const Container = styled.div`
    width: 100%;
`;

export const ContentContainer = styled(Container)``;

export const TableContainer = styled(Container)`
    overflow-x: auto;
`;

// Layout Components
export const Header = styled.div`
    ${baseFlexContainer}
    justify-content: space-between;
    align-items: center;
    ${baseSpacing}
`;

export const PageHeader = styled(Header)``;

export const ReportHeader = styled(Header)`
    margin-bottom: 30px;
`;

export const FilterContainer = styled.div`
    ${baseFlexContainer}
    align-items: center;
    ${baseSpacing}
`;

export const ReportFilters = styled(FilterContainer)`
    align-items: flex-end;
`;

export const ButtonContainer = styled.div`
    ${baseFlexContainer}
    justify-content: flex-end;
    margin-top: 20px;
    gap: 10px;
`;

export const ButtonGroup = styled.div`
    ${baseFlexContainer}
    gap: 8px;
    align-items: flex-end;
`;

export const TableActions = styled(ButtonGroup)``;

// Form Components
export const FormField = styled.div`
    margin-bottom: 15px;
`;

export const Field = styled(FormField)``;

export const FormLabel = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
`;

export const Label = styled(FormLabel)``;

// Table Components
export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

export const TableHeader = styled.th`
    ${baseTableCell}
    border-bottom: 2px solid #ddd;
`;

export const TableCell = styled.td`
    ${baseTableCell}
`;

export const Button = styled.button<{ variant?: 'primary' | 'danger' | 'default', hasMarginTop?: boolean }>`
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    background-color: ${props => {
        if (props.variant === 'primary') return '#1a3040';
        if (props.variant === 'danger') return '#dc3545';
        return '#6c757d';
    }};
    color: white;
    margin-top: ${props => props.hasMarginTop ? '8px' : '0'};
    
    &:hover {
        opacity: 0.9;
    }
    
    &:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

// Use the new Button variant system
export const DateApplyButton = styled(Button)`
    margin-top: 8;
`;

export const Select = styled.select<{ hasError?: boolean }>`
    ${baseInputStyles}
    border-color: ${props => props.hasError ? 'red' : '#ddd'};
`;

export const Input = styled.input<{ hasError?: boolean }>`
    ${baseInputStyles}
    border-color: ${props => props.hasError ? 'red' : '#ddd'};
`;

export const DatePicker = styled(Input).attrs({ type: 'date' })`
    // Additional date picker specific styles can go here
`;

export const ErrorMessage = styled.div`
    color: red;
    font-size: 12px;
`;

// Detail Components
export const DetailsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

export const DetailsItem = styled.li`
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    &:last-child {
        border-bottom: none;
    }
`;

export const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
`;

export const DetailLabel = styled.span`
    font-weight: bold;
    color: #000;
`;

export const DetailValue = styled.span`
    color: #000;
`;

export const ActionButton = styled(Button)<{ action?: 'edit' | 'delete' }>`
    padding: 6px 12px;
    background-color: ${props => {
        if (props.action === 'delete') return '#dc3545';
        if (props.action === 'edit') return '#1a3040';
        return '#6c757d';
    }};
    color: white;
    &:hover {
        opacity: 0.9;
    }
`;

export const ApplyFilterButton = styled(ActionButton)`
    margin-bottom: 20px;
`;