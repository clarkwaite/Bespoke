import React, { useState, useEffect, useCallback } from 'react';
import { Product, ApiResponse } from '../../types';
import { formStyles } from '../shared/styles';
import { ProductsModal } from './ProductsModal';

type ErrorMessage = {
    message: string;
    type: 'error' | 'success';
};

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState<ErrorMessage | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showNotification = useCallback((message: string, type: 'error' | 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await response.json();
            setProducts(productsData);
        } catch (error) {
            showNotification('Failed to load products. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const openProductModal = useCallback((product?: Product) => {
        setEditingProduct(product || null);
        setIsModalOpen(true);
    }, []);

    const handleSaveProduct = useCallback(async (product: Omit<Product, 'id'> & { id?: number }) => {
        try {
            if (product.id) {
                // Update existing product
                const response = await fetch(`/api/products/${product.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                });

                if (!response.ok) {
                    throw new Error('Failed to update product');
                }

                const data: ApiResponse<Product> = await response.json();
                if (data.success) {
                    setProducts(prevProducts =>
                        prevProducts.map(p => (p.id === product.id ? data.data : p))
                    );
                    showNotification('Product updated successfully', 'success');
                } else {
                    throw new Error(data.message || 'Failed to update product');
                }
            } else {
                // Add new product
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product),
                });

                if (!response.ok) {
                    throw new Error('Failed to create product');
                }

                const data: ApiResponse<Product> = await response.json();
                if (data.success) {
                    setProducts(prevProducts => [...prevProducts, data.data]);
                    showNotification('Product added successfully', 'success');
                } else {
                    throw new Error(data.message || 'Failed to create product');
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            showNotification(
                error instanceof Error ? error.message : 'Failed to save product. Please try again.',
                'error'
            );
        }
    }, [showNotification]);

    const handleDeleteProduct = useCallback(async (productId: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            showNotification('Product deleted successfully', 'success');
        } catch (error) {
            showNotification(
                error instanceof Error ? error.message : 'Failed to delete product. Please try again.',
                'error'
            );
        }
    }, [showNotification]);

    return (
        <div>
            {notification && (
                <div
                    style={{
                        padding: '10px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        backgroundColor: notification.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: notification.type === 'error' ? '#dc2626' : '#16a34a',
                    }}
                >
                    {notification.message}
                </div>
            )}

            <ProductsModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                product={editingProduct}
                handleSave={handleSaveProduct}
                isEditMode={Boolean(editingProduct)}
                existingProducts={products}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Products</h2>
                <button
                    onClick={() => openProductModal()}
                    style={{ ...formStyles.button, ...formStyles.saveButton }}
                >
                    Add New Product
                </button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>No products found.</div>
            ) : (
                <table style={formStyles.table}>
                    <thead>
                        <tr>
                            <th style={formStyles.th}>Name</th>
                            <th style={formStyles.th}>Manufacturer</th>
                            <th style={formStyles.th}>Style</th>
                            <th style={{ ...formStyles.th, textAlign: 'right' }}>Purchase Price</th>
                            <th style={{ ...formStyles.th, textAlign: 'right' }}>Sale Price</th>
                            <th style={{ ...formStyles.th, textAlign: 'right' }}>Quantity</th>
                            <th style={{ ...formStyles.th, textAlign: 'right' }}>Commission %</th>
                            <th style={{ ...formStyles.th, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td style={formStyles.td}>{product.name}</td>
                                <td style={formStyles.td}>{product.manufacturer}</td>
                                <td style={formStyles.td}>{product.style}</td>
                                <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                    ${product.purchasePrice.toFixed(2)}
                                </td>
                                <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                    ${product.salePrice.toFixed(2)}
                                </td>
                                <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                    {product.qtyOnHand}
                                </td>
                                <td style={{ ...formStyles.td, textAlign: 'right' }}>
                                    {product.commissionPercentage}%
                                </td>
                                <td style={{ ...formStyles.td, textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => openProductModal(product)}
                                            style={{ ...formStyles.button, ...formStyles.saveButton }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            style={formStyles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Products;