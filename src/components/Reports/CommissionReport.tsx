import React, { useState, useEffect, useCallback } from 'react';
import { CommissionReport, Salesperson, Sale, ApiResponse } from '../../types';
import Modal from '../shared/Modal';
import { formStyles } from '../shared/formStyles';

const CommissionReports: React.FC = () => {
    const [reports, setReports] = useState<CommissionReport[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.floor(new Date().getMonth() / 3) + 1);
    const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
    const [selectedReport, setSelectedReport] = useState<CommissionReport | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [alertModalConfig, setAlertModalConfig] = useState({
        isOpen: false,
        message: ''
    });

    const showAlert = (message: string) => {
        setAlertModalConfig({ isOpen: true, message });
    };

    const fetchSalespersonsAndSales = useCallback(async () => {
        try {
            // Fetch salespersons
            const salespersonsResponse = await fetch('/api/salespersons', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const salespersonsData: Salesperson[] = await salespersonsResponse.json();
            
            if (!salespersonsData.length) {
                showAlert('Failed to fetch salespersons data');
                return;
            }

            setSalespersons(salespersonsData);

            // Calculate date range for the selected quarter
            const startDate = new Date(selectedYear, (selectedQuarter - 1) * 3, 1);
            const endDate = new Date(selectedYear, selectedQuarter * 3, 0);
            
            const queryParams = new URLSearchParams({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });

            // Fetch sales for the date range
            const salesResponse = await fetch(`/api/sales?${queryParams}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const salesData: Sale[] = await salesResponse.json();

            if (!salesData.length) {
                showAlert('Failed to fetch sales data');
                return;
            }

            // Calculate commission reports
            const calculatedReports = calculateCommissionReports(salespersonsData, salesData);
            setReports(calculatedReports);

        } catch (error) {
            console.error('Error fetching data:', error);
            showAlert('Failed to fetch data');
        }
    }, [selectedYear, selectedQuarter]); // Include dependencies for useCallback

    useEffect(() => {
        fetchSalespersonsAndSales();
    }, [fetchSalespersonsAndSales]); // Now properly depends on the memoized function

    const calculateCommissionReports = (salespersons: Salesperson[], sales: Sale[]): CommissionReport[] => {
        // Create a map to group sales by salesperson
        const salesBySalesperson = new Map<number, Sale[]>();
        
        // Initialize the map with empty arrays for all salespersons
        salespersons.forEach(sp => {
            salesBySalesperson.set(sp.id, []);
        });

        // Group sales by salesperson
        sales.forEach(sale => {
            const existingSales = salesBySalesperson.get(sale.salesPersonId) || [];
            existingSales.push(sale);
            salesBySalesperson.set(sale.salesPersonId, existingSales);
        });

        // Calculate commission reports for each salesperson
        return Array.from(salesBySalesperson.entries())
            .map(([salespersonId, salesList]) => {
                let totalSales = 0;
                let totalCommission = 0;

                // Calculate totals
                salesList.forEach(sale => {
                    const saleAmount = sale.product.salePrice;
                    const commissionPercentage = sale.product.commissionPercentage;
                    totalSales += saleAmount;
                    totalCommission += (saleAmount * (commissionPercentage / 100));
                });

                return {
                    salespersonId,
                    totalSales,
                    totalCommission,
                    salesDetails: salesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending
                };
            })
            .filter(report => report.salesDetails.length > 0) // Only show salespersons with sales
            .sort((a, b) => b.totalCommission - a.totalCommission); // Sort by commission amount descending
    };

    const getSalespersonName = (id: number): string => {
        const salesperson = salespersons.find(sp => sp.id === id);
        return salesperson ? `${salesperson.firstName} ${salesperson.lastName}` : 'Unknown';
    };

    return (
        <div>
            <Modal
                isOpen={alertModalConfig.isOpen}
                onRequestClose={() => setAlertModalConfig({ ...alertModalConfig, isOpen: false })}
                title="Notice"
                message={alertModalConfig.message}
            />

            <Modal
                isOpen={isDetailsModalOpen}
                onRequestClose={() => setIsDetailsModalOpen(false)}
                title={`Sales Details - ${selectedReport ? getSalespersonName(selectedReport.salespersonId) : ''}`}
                showConfirmButton={false}
            >
                {selectedReport && (
                    <div>
                        <table style={formStyles.table}>
                            <thead>
                                <tr>
                                    <th style={formStyles.th}>Date</th>
                                    <th style={formStyles.th}>Product</th>
                                    <th style={formStyles.th}>Customer</th>
                                    <th style={formStyles.th}>Sale Price</th>
                                    <th style={formStyles.th}>Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReport.salesDetails.map(sale => (
                                    <tr key={sale.id}>
                                        <td style={formStyles.td}>
                                            {new Date(sale.date).toLocaleDateString()}
                                        </td>
                                        <td style={formStyles.td}>{sale.product.name}</td>
                                        <td style={formStyles.td}>
                                            {`${sale.customer.firstName} ${sale.customer.lastName}`}
                                        </td>
                                        <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                            ${sale.product.salePrice.toFixed(2)}
                                        </td>
                                        <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                            ${(sale.product.salePrice * (sale.product.commissionPercentage / 100)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} style={{ ...formStyles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                        Total:
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                        ${selectedReport.totalSales.toFixed(2)}
                                    </td>
                                    <td style={{ ...formStyles.td, textAlign: 'right', fontWeight: 'bold' }}>
                                        ${selectedReport.totalCommission.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button
                                style={formStyles.button}
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <h2>Quarterly Commission Reports</h2>
            
            <div style={formStyles.filterContainer}>
                <div style={formStyles.field}>
                    <label style={formStyles.label}>Year</label>
                    <select 
                        style={formStyles.select}
                        value={selectedYear}
                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                    >
                        {[...Array(5)].map((_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div style={formStyles.field}>
                    <label style={formStyles.label}>Quarter</label>
                    <select 
                        style={formStyles.select}
                        value={selectedQuarter}
                        onChange={e => setSelectedQuarter(parseInt(e.target.value))}
                    >
                        {[1, 2, 3, 4].map(quarter => (
                            <option key={quarter} value={quarter}>
                                Q{quarter}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <table style={formStyles.table}>
                <thead>
                    <tr>
                        <th style={formStyles.th}>Salesperson</th>
                        <th style={{ ...formStyles.th, textAlign: 'right' }}>Total Sales</th>
                        <th style={{ ...formStyles.th, textAlign: 'right' }}>Total Commission</th>
                        <th style={{ ...formStyles.th, textAlign: 'center' }}>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.salespersonId}>
                            <td style={formStyles.td}>
                                {getSalespersonName(report.salespersonId)}
                            </td>
                            <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                ${report.totalSales.toFixed(2)}
                            </td>
                            <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                ${report.totalCommission.toFixed(2)}
                            </td>
                            <td style={{ ...formStyles.td, textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setIsDetailsModalOpen(true);
                                    }}
                                    style={formStyles.button}
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CommissionReports;