'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TribeProductsPage() {
  const params = useParams();
  const router = useRouter();
  const [tribe, setTribe] = useState(null);
  const [curatedProducts, setCuratedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTribeAndProducts();
    fetchAllProducts();
  }, [params.tribeId]);

  const fetchTribeAndProducts = async () => {
    try {
      // Fetch tribe details
      const tribeRes = await fetch(`/api/tribes/${params.tribeId}`);
      const tribeData = await tribeRes.json();
      setTribe(tribeData.tribe || tribeData); // Handle both response formats

      // Fetch curated products
      const productsRes = await fetch(`/api/admin/tribes/${params.tribeId}/products`);
      const productsData = await productsRes.json();
      setCuratedProducts(productsData);
    } catch (error) {
      console.error('Error fetching tribe and products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching all products:', error);
    }
  };

  const addProductToCuration = async (productId) => {
    try {
      const res = await fetch(`/api/admin/tribes/${params.tribeId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          reason: 'Admin curated'
        })
      });

      if (res.ok) {
        fetchTribeAndProducts();
        setShowAddModal(false);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const removeProductFromCuration = async (productId) => {
    if (!confirm('Are you sure you want to remove this product from curation?')) return;

    try {
      const res = await fetch(`/api/admin/tribes/${params.tribeId}/products`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });

      if (res.ok) {
        fetchTribeAndProducts();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to remove product');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Failed to remove product');
    }
  };

  const filteredProducts = allProducts.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableProducts = filteredProducts.filter(product =>
    !curatedProducts.some(cp => cp.product._id === product._id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Products for {tribe?.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Curate products for this tribe to create a personalized shopping experience
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 font-medium"
          >
            Add Products
          </button>
        </div>

        {/* Curated Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Curated Products ({curatedProducts.length})
            </h2>
          </div>
          <div className="p-6">
            {curatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products curated yet.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curatedProducts.map((curatedProduct) => (
                  <div key={curatedProduct._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={curatedProduct.product.images[0]}
                      alt={curatedProduct.product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {curatedProduct.product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {curatedProduct.product.brand}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{curatedProduct.product.price}
                        </span>
                        {curatedProduct.product.mrp > curatedProduct.product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{curatedProduct.product.mrp}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeProductFromCuration(curatedProduct.product._id)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm"
                      >
                        Remove from Curation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Products Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Products to Curation</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* Products Grid */}
                <div className="max-h-96 overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      {searchTerm ? 'No products found matching your search.' : 'All products are already curated.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableProducts.map((product) => (
                        <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              {product.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {product.brand}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{product.price}
                              </span>
                              {product.mrp > product.price && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{product.mrp}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => addProductToCuration(product._id)}
                              className="w-full bg-pink-600 text-white py-1 px-2 rounded hover:bg-pink-700 text-xs"
                            >
                              Add to Curation
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}