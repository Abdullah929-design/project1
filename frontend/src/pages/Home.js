import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AddToCartButton from '../components/Cart/AddToCartButton';
import './Home.css';

function Home() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/category`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products`)
        ]);

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search from URL params
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory || 
        product.category?._id === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to PetStore</h1>
            <p className="hero-subtitle">
              Discover premium pet supplies and accessories for your beloved companions
            </p>
            <div className="hero-search">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button className="btn btn-primary hero-search-btn">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        {/* Category Filter */}
        <section className="category-filter">
          <div className="filter-header">
            <h2>Categories</h2>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button onClick={clearFilters} className="btn btn-outline btn-sm">
                Clear Filters
              </button>
            )}
          </div>
          <div className="category-buttons">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                className={`category-btn ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category._id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Search Results Info */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="search-info">
            <p>
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${categories.find(c => c._id === selectedCategory)?.name}`}
            </p>
          </div>
        )}

        {/* Products Grid */}
        <section className="products-section">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <h3>No products found</h3>
              <p>
                {searchQuery 
                  ? `No products match "${searchQuery}"`
                  : 'No products available in this category'
                }
              </p>
              <button onClick={clearFilters} className="btn btn-primary">
                View All Products
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="product-card">
      <div className="product-image-container">
        {!imageLoaded && !imageError && (
          <div className="image-skeleton"></div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`product-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ display: imageError ? 'none' : 'block' }}
        />
        {imageError && (
          <div className="image-error">
            <span>📷</span>
            <p>Image not available</p>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name" title={product.name}>
          {product.name.length > 30 
            ? `${product.name.substring(0, 30)}...` 
            : product.name
          }
        </h3>
        <p className="product-description" title={product.description}>
          {product.description.length > 60 
            ? `${product.description.substring(0, 60)}...` 
            : product.description
          }
        </p>
        <div className="product-meta">
          <span className="product-price">${product.price}</span>
          <span className={`product-stock ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
          </span>
        </div>
        
        {/* Add to Cart and Quantity Controls */}
        <div className="product-actions">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}

export default Home;
