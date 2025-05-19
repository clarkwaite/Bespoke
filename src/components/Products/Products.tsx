import React, { useState, useEffect } from 'react';
import { Product, ProductFormData, ApiResponse } from '../../types';
import Modal from '../shared/Modal';
import { formStyles } from '../shared/formStyles';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [alertModalConfig, setAlertModalConfig] = useState({
        isOpen: false,
        message: ''
    });
    const [newProduct, setNewProduct] = useState<ProductFormData>({
        name: '',
        manufacturer: '',
        style: '',
        purchasePrice: 0,
        salePrice: 0,
        qtyOnHand: 0,
        commissionPercentage: 0
    });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const showAlert = (message: string) => {
        setAlertModalConfig({ isOpen: true, message });
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            
            // TODO: Handle Errors and Update to React Query
            
            const data: Product[] = await response.json();

            if (data.length) {
                setProducts(data);
            } else {
                showAlert('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            showAlert('Failed to fetch products. Please try again later.');
        }
    };

    const handleAddProduct = async () => {
        if (products.some(product =>
            product.name.toLowerCase() === newProduct.name.toLowerCase() &&
            product.manufacturer.toLowerCase() === newProduct.manufacturer.toLowerCase()
        )) {
            showAlert('A product with this name and manufacturer already exists.');
            return;
        }

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProduct)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<Product> = await response.json();
            if (data.success) {
                setProducts([...products, data.data]);
                setNewProduct({
                    name: '',
                    manufacturer: '',
                    style: '',
                    purchasePrice: 0,
                    salePrice: 0,
                    qtyOnHand: 0,
                    commissionPercentage: 0
                });
                setIsAddModalOpen(false);
            } else {
                showAlert(data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showAlert('Failed to create product');
        }
    };

    const handleEditProduct = async () => {
        if (!editingProduct) return;

        if (products.some(product =>
            product.id !== editingProduct.id &&
            product.name.toLowerCase() === editingProduct.name.toLowerCase() &&
            product.manufacturer.toLowerCase() === editingProduct.manufacturer.toLowerCase()
        )) {
            showAlert('A product with this name and manufacturer already exists.');
            return;
        }

        try {
            const response = await fetch(`/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingProduct)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<Product> = await response.json();
            if (data.success) {
                setProducts(products.map(product =>
                    product.id === editingProduct.id ? data.data : product
                ));
                setIsEditModalOpen(false);
                setEditingProduct(null);
            } else {
                showAlert(data.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showAlert('Failed to update product');
        }
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
                isOpen={isAddModalOpen}
                onRequestClose={() => setIsAddModalOpen(false)}
                title="Add New Product"
                showConfirmButton={false}
            >
                <div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Name</label>
                        <input
                            style={formStyles.input}
                            type="text"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                    </div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Manufacturer</label>
                        <input
                            style={formStyles.input}
                            type="text"
                            value={newProduct.manufacturer}
                            onChange={e => setNewProduct({ ...newProduct, manufacturer: e.target.value })}
                        />
                    </div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Style</label>
                        <input
                            style={formStyles.input}
                            type="text"
                            value={newProduct.style}
                            onChange={e => setNewProduct({ ...newProduct, style: e.target.value })}
                        />
                    </div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Purchase Price ($)</label>
                        <input
                            style={formStyles.input}
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.purchasePrice}
                            onChange={e => setNewProduct({ ...newProduct, purchasePrice: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Sale Price ($)</label>
                        <input
                            style={formStyles.input}
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.salePrice}
                            onChange={e => setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Quantity on Hand</label>
                        <input
                            style={formStyles.input}
                            type="number"
                            min="0"
                            value={newProduct.qtyOnHand}
                            onChange={e => setNewProduct({ ...newProduct, qtyOnHand: parseInt(e.target.value) })}
                        />
                    </div>
                    <div style={formStyles.field}>
                        <label style={formStyles.label}>Commission Percentage (%)</label>
                        <input
                            style={formStyles.input}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={newProduct.commissionPercentage}
                            onChange={e => setNewProduct({ ...newProduct, commissionPercentage: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div style={formStyles.buttonContainer}>
                        <button
                            style={{ ...formStyles.button, ...formStyles.cancelButton }}
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            style={{ ...formStyles.button, ...formStyles.saveButton }}
                            onClick={handleAddProduct}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={() => setIsEditModalOpen(false)}
                title="Edit Product"
                showConfirmButton={false}
            >
                {editingProduct && (
                    <div>
                        <div style={formStyles.field}>
                            <label style={formStyles.label}>Name</label>
                            <input
                                style={formStyles.input}
                                type="text"
                                value={editingProduct.name}
                                onChange={e => setEditingProduct({
                                    ...editingProduct,
                                    name: e.target.value
                                })}
                            />
                        </div>
                        <div style={formStyles.field}>
                            <label style={formStyles.label}>Manufacturer</label>
                            <input
                                style={formStyles.input}
                                type="text"
                                value={editingProduct.manufacturer}
                                onChange={e => setEditingProduct({
                                    ...editingProduct,
                                    manufacturer: e.target.value
                                })}
                            />
                        </div>
                        <div style={formStyles.field}>
                            <label style={formStyles.label}>Style</label>
                            <input
                                style={formStyles.input}
                                type="text"
                                value={editingProduct.style}
                                onChange={e => setEditingProduct({
                                    ...editingProduct,
                                    style: e.target.value
                                })}
                            />
                        </div>
                        <div style={formStyles.field}>
                            <label style={formStyles.label}>Purchase Price ($)</label>
                            <input
                                style={formStyles.input}
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingProduct.purchasePrice}
                                onChange={e => setEditingProduct({
                                    ...editingProduct,
                                    purchasePrice: parseFloat(e.target.value)
                                })}
                            />
                        </div>
                        <div style={formStyles.field}>
                            <label style={formStyles.label}>Sale Price ($)</label>
                            <input
                                style={formStyles.input}
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingProduct.salePrice}
                                onChange={e => setEditingProduct({
                                    ...editingProduct,
                                    salePrice: parseFloat(e.target.value)
                                })}
                            />
                        </div>
                        <div style={formStyles.field}>
                            <label style={formStyles.label}>Quantity on Hand</label>
                            <input
                                style={formStyles.input}
                                type="number"
                                min="0"
                                value={editingProduct.qtyOnHand}
                                onChange={e => setEditingProduct({
                                    ...editingProduct,
                                    qtyOnHand: parseInt(e.target.value)
                                })}
                            />
                        </div>
                        <div style={formStyles.field}>
                            <label style={formStyles.label}>Commission Percentage (%)</label>
                            <input
                                style={formStyles.input}
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={editingProduct.commissionPercentage}
                                onChange={e => setEditingProduct({
                                    ...editingProduct,
                                    commissionPercentage: parseFloat(e.target.value)
                                })}
                            />
                        </div>
                        <div style={formStyles.buttonContainer}>
                            <button
                                style={{ ...formStyles.button, ...formStyles.cancelButton }}
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...formStyles.button, ...formStyles.saveButton }}
                                onClick={handleEditProduct}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Products</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    style={{ ...formStyles.button, ...formStyles.saveButton }}
                >
                    Add New Product
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Manufacturer</th>
                        <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd' }}>Style</th>
                        <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #ddd' }}>Purchase Price</th>
                        <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #ddd' }}>Sale Price</th>
                        <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #ddd' }}>Quantity</th>
                        <th style={{ textAlign: 'right', padding: '12px', borderBottom: '2px solid #ddd' }}>Commission %</th>
                        <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #ddd' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{product.name}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{product.manufacturer}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{product.style}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                                ${product.purchasePrice.toFixed(2)}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                                ${product.salePrice.toFixed(2)}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                                {product.qtyOnHand}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>
                                {product.commissionPercentage}%
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setIsEditModalOpen(true);
                                    }}
                                    style={{ ...formStyles.button, ...formStyles.saveButton }}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Products;