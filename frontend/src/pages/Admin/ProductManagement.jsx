import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    originalPrice: '',
    discountPrice: '',
    shippingFee: '',
    stock: '',
    images: []
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    // Debug: Check authentication status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Auth check - Token exists:', !!token);
    console.log('Auth check - User data:', user ? JSON.parse(user) : 'No user');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=100');
      console.log('Fetched products response:', response);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      // Try /categories endpoint first (dedicated categories endpoint)
      const response = await api.get('/categories');
      console.log('Fetched categories from /categories endpoint');
      console.log('Fetched categories response:', response);
      console.log('Fetched categories data:', response.data);
      const categoriesList = Array.isArray(response.data) ? response.data : [];
      console.log('Setting categories list (length):', categoriesList.length);
      if (categoriesList.length > 0) {
        console.log('Categories:', categoriesList.map(c => ({ id: c._id, name: c.name })));
      }
      setCategories(categoriesList);
      return categoriesList;
    } catch (error) {
      console.error('Failed to fetch categories from /categories, trying /products/categories:', error);
      try {
        // Fallback to /products/categories endpoint
        const response = await api.get('/products/categories');
        const categoriesList = Array.isArray(response.data) ? response.data : [];
        console.log('Fetched from /products/categories, count:', categoriesList.length);
        setCategories(categoriesList);
        return categoriesList;
      } catch (fallbackError) {
        console.error('Failed to fetch categories from both endpoints:', fallbackError);
        setCategories([]);
        return [];
      }
    }
  }, []);

  const handleCreateCategory = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('=== handleCreateCategory called ===');
    console.log('Category name value:', newCategoryName);
    
    if (!newCategoryName.trim()) {
      console.log('Validation failed: Category name is empty');
      alert('Category name is required');
      return;
    }

    setCreatingCategory(true);
    try {
      console.log('=== Starting category creation ===');
      console.log('Creating category with name:', newCategoryName.trim());
      const response = await api.post('/categories', {
        name: newCategoryName.trim(),
        description: ''
      });
      
      console.log('Category creation response:', response);
      console.log('Category creation response.data:', response.data);
      
      const newCategory = response.data;
      
      if (!newCategory || !newCategory._id) {
        console.error('Invalid category response:', newCategory);
        alert('Category was created but received invalid response. Please refresh the page.');
        return;
      }
      
      console.log('New category created successfully:', newCategory);
      
      // Add the new category to the state immediately for instant UI update
      setCategories(prevCategories => {
        const exists = prevCategories.some(cat => cat._id === newCategory._id);
        if (exists) {
          console.log('Category already exists in state');
          return prevCategories;
        }
        const updated = [...prevCategories, newCategory].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        console.log('Added category to state, new length:', updated.length);
        return updated;
      });
      
      // Select the newly created category
      setFormData(prevFormData => {
        console.log('Setting category to:', newCategory._id);
        return {
          ...prevFormData,
          category: newCategory._id
        };
      });
      
      // Reset and hide the add category form
      setNewCategoryName('');
      setShowAddCategory(false);
      
      // Refresh categories list in background to ensure sync
      fetchCategories().then(cats => {
        console.log('Categories refreshed from server, count:', cats.length);
      }).catch(err => {
        console.error('Background refresh failed:', err);
      });
    } catch (error) {
      console.error('Failed to create category - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create category';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
        
        if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'Admin access required. You do not have permission to create categories.';
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else {
        // Error in request setup
        errorMessage = error.message || 'Failed to create category';
      }
      
      alert(`Failed to create category: ${errorMessage}`);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key !== 'images') {
        formDataToSend.append(key, formData[key]);
      }
    });

    formData.images.forEach(file => {
      formDataToSend.append('images', file);
    });

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setShowForm(false);
      setEditingProduct(null);
      setShowAddCategory(false);
      setNewCategoryName('');
      setFormData({
        name: '',
        description: '',
        category: '',
        originalPrice: '',
        discountPrice: '',
        shippingFee: '',
        stock: '',
        images: []
      });
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddCategory(false);
    setNewCategoryName('');
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category._id || product.category,
      originalPrice: product.originalPrice,
      discountPrice: product.discountPrice || '',
      shippingFee: product.shippingFee || '',
      stock: product.stock,
      images: []
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingProduct(null);
              setShowAddCategory(false);
              setNewCategoryName('');
              setFormData({
                name: '',
                description: '',
                category: '',
                originalPrice: '',
                discountPrice: '',
                stock: '',
                images: []
              });
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Add Product
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(!showAddCategory);
                        if (showAddCategory) {
                          setNewCategoryName('');
                        }
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {showAddCategory ? 'Cancel' : '+ Add Category'}
                    </button>
                  </div>
                  {showAddCategory ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateCategory(e);
                          }
                        }}
                        placeholder="Enter category name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory}
                        className="w-full bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingCategory ? 'Creating...' : 'Create Category'}
                      </button>
                    </div>
                  ) : (
                    <select
                      key={`category-select-${categories.length}`}
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Category</option>
                      {categories && categories.length > 0 ? (
                        categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))
                      ) : (
                        <option disabled>No categories available</option>
                      )}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Fee (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingFee}
                    onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave 0 for free shipping</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setShowAddCategory(false);
                    setNewCategoryName('');
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No products found.</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Product" to create your first product.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.images?.[0] || '/placeholder-image.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs. {(product.discountPrice || product.originalPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;

