import React from 'react';

function CategoryForm({ name, setName, editId, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="category-form">
      <div className="category-input-group">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="category-input"
        />
        <button type="submit" className="category-button">
          {editId ? 'Update' : 'Add'} Category
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
