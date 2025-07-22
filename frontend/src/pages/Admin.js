import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryForm from '../components/admin/Category_Form_temp';
import CategoryList from '../components/admin/CategoryList';
import AdminPaymentMethods from '../components/admin/AdminPaymentMethods';
import AdminOrders from '../components/admin/AdminOrders';
import AdminAboutSection from './AdminAboutSection';
import './Admin.css';

function Admin() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    quantity: '',
    description: '',
    image: '',
    category: '',
    price: ''
  });
  const [editProductId, setEditProductId] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // ✅ Redirect if no token
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const res = await fetch(`${API_BASE_URL}/api/category`);
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const res = await fetch(`${API_BASE_URL}/api/products`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Category Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const url = editId
      ? `${API_BASE_URL}/api/category/${editId}`
      : `${API_BASE_URL}/api/category`;
    const method = editId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    setName('');
    setEditId(null);
    fetchCategories();
  };

  const handleCategoryDelete = async (id) => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    await fetch(`${API_BASE_URL}/api/category/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCategories();
  };

  const handleCategoryEdit = (cat) => {
    setName(cat.name);
    setEditId(cat._id);
  };

  // Product Handlers
  const handleProductChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const url = editProductId
      ? `${API_BASE_URL}/api/products/${editProductId}`
      : `${API_BASE_URL}/api/products`;
    const method = editProductId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productForm)
    });

    setProductForm({ name: '', quantity: '', description: '', image: '', category: '', price: '' });
    setEditProductId(null);
    fetchProducts();
  };

  const handleProductDelete = async (id) => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProducts();
  };

  const handleProductEdit = (prod) => {
    if (!prod || !prod._id || !prod.category || !prod.category._id) {
      console.error('Invalid product for editing:', prod);
      return;
    }
    setProductForm({
      name: prod.name,
      quantity: prod.quantity,
      description: prod.description,
      image: prod.image,
      category: prod.category._id,
      price: prod.price
    });
    setEditProductId(prod._id);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab ${activeTab === 'payment-methods' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          Payment Methods
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Page
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'categories' && (
          <div>
            <h2>Manage Categories</h2>
            <CategoryForm
              name={name}
              setName={setName}
              editId={editId}
              handleSubmit={handleCategorySubmit}
            />
            <CategoryList
              categories={categories}
              handleEdit={handleCategoryEdit}
              handleDelete={handleCategoryDelete}
            />
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2>Manage Products</h2>
            <form onSubmit={handleProductSubmit} className="product-form">
              <input name="name" placeholder="Product Name" value={productForm.name} onChange={handleProductChange} required />
              <input name="quantity" placeholder="Quantity" type="number" value={productForm.quantity} onChange={handleProductChange} required />
              <textarea name="description" placeholder="Description" value={productForm.description} onChange={handleProductChange} required />
              <input name="image" placeholder="Image URL" value={productForm.image} onChange={handleProductChange} required />
              <input name='price' type="number" placeholder="Price" value={productForm.price} onChange={handleProductChange} required/>
              <select name="category" value={productForm.category} onChange={handleProductChange} required>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <button type="submit">{editProductId ? 'Update Product' : 'Add Product'}</button>
            </form>

            {/* Product List */}
            <div className="products-grid">
              <h3>All Products</h3>
              {products.map((prod) => (
                <div key={prod._id} className="product-card">
                  <img src={prod.image} alt={prod.name} />
                  <h4>{prod.name}</h4>
                  <p>{prod.description}</p>
                  <p>Quantity: {prod.quantity}</p>
                  <p>Category: {prod.category?.name}</p>
                  <p>Price: ${prod.price}</p>
                  <div className="product-actions">
                    <button onClick={() => handleProductEdit(prod)}>Edit</button>
                    <button onClick={() => handleProductDelete(prod._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payment-methods' && (
          <AdminPaymentMethods />
        )}

        {activeTab === 'orders' && (
          <AdminOrders />
        )}

        {activeTab === 'about' && (
          <AdminAboutSection token={token} />
        )}
      </div>
    </div>
  );
}

export default Admin;
