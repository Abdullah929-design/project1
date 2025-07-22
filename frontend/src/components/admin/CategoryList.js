import React from 'react';

function CategoryList({ categories, handleEdit, handleDelete }) {
  return (
    <div className="category-list-container">
      <h2 className="category-list-title">All Categories</h2>
      <div className="category-list">
        {categories.map((cat) => (
          <div key={cat._id} className="category-item">
            <span className="category-name">{cat.name}</span>
            <div className="category-actions">
              <button 
                onClick={() => handleEdit(cat)}
                className="category-edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(cat._id)}
                className="category-delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryList;
