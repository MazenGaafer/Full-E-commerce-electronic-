import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Tag } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchBrands();
  }, [searchTerm]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? `?search=${searchTerm}` : '';
      const { data } = await API.get(`/brands${params}`);
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Unable to load brands. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (brand = null) => {
    if (brand) {
      setEditMode(true);
      setCurrentBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || '',
      });
    } else {
      setEditMode(false);
      setCurrentBrand(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentBrand(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && currentBrand) {
        await API.put(`/brands/${currentBrand.id}`, formData);
        toast.success('Brand updated successfully!');
      } else {
        await API.post('/brands', formData);
        toast.success('Brand created successfully!');
      }
      closeModal();
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(error.response?.data?.message || 'Unable to save brand. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will affect all products from this brand.')) return;

    try {
      await API.delete(`/brands/${id}`);
      toast.success('Brand deleted successfully!');
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error(error.response?.data?.message || 'Unable to delete brand. Please try again later.');
    }
  };

  const brandColors = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brands Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage product brands and manufacturers</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : brands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brands.map((brand, index) => (
            <div key={brand.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${brandColors[index % brandColors.length]} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Tag className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(brand)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{brand.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{brand.description || 'No description'}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm font-semibold text-primary-600">
                  {brand._count?.products || 0} products
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(brand.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No brands found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {editMode ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Apple, Samsung, Dell"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe this brand..."
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editMode ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
