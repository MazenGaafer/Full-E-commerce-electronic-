import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { Star, Filter, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useCompareStore from '../store/compareStore';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const { addToCompare } = useCompareStore();

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    page: searchParams.get('page') || '1',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        API.get('/categories'),
        API.get('/brands'),
      ]);
      setCategories(categoriesRes.data.categories);
      setBrands(brandsRes.data.brands);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Unable to load filters. Some filtering options may not be available.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      searchParams.forEach((value, key) => {
        if (value) params[key] = value;
      });

      const { data } = await API.get('/products', { params });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Unable to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: '1' }));
  };

  const applyFilters = () => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'createdAt',
      order: 'desc',
      page: '1',
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page: page.toString() };
    setFilters(newFilters);
    const params = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) params[key] = newFilters[key];
    });
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCompare = (product) => {
    try {
      addToCompare(product);
      toast.success('Added to comparison');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Electronics Store</h1>
          <p className="text-gray-600">Discover the latest in technology</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" />
          </div>
          <button onClick={applyFilters} className="btn-primary px-6">
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline px-6 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full input-field"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="$0"
                  className="w-full input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="$10000"
                  className="w-full input-field"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full input-field"
                >
                  <option value="createdAt">Newest</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <select
                  value={filters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  className="w-full input-field"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <button onClick={applyFilters} className="btn-primary flex-1">
                Apply Filters
              </button>
              <button onClick={clearFilters} className="btn-secondary flex-1">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.search) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.search && (
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Search: {filters.search}
                <button onClick={() => { handleFilterChange('search', ''); applyFilters(); }}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Category: {filters.category}
                <button onClick={() => { handleFilterChange('category', ''); applyFilters(); }}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.brand && (
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Brand: {filters.brand}
                <button onClick={() => { handleFilterChange('brand', ''); applyFilters(); }}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); applyFilters(); }}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          {pagination.total} products found
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button 
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div key={product.id} className="card-hover">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-200 overflow-hidden">
                      {product.images[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </Link>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">{product.brand?.name}</p>
                      {product.stock > 0 ? (
                        <span className="badge-success">In Stock</span>
                      ) : (
                        <span className="badge-danger">Out of Stock</span>
                      )}
                    </div>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium">{product.averageRating || 0}</span>
                        <span className="text-sm text-gray-600 ml-1">({product.reviewCount || 0})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.salePrice ? (
                          <>
                            <span className="text-2xl font-bold gradient-text">${product.salePrice}</span>
                            <span className="text-lg text-gray-500 line-through ml-2">${product.price}</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold gradient-text">${product.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Link to={`/products/${product.id}`} className="btn-outline text-sm flex-1 text-center">
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCompare(product)}
                        className="btn-primary text-sm px-4"
                        title="Add to compare"
                        disabled={product.stock <= 0}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-outline px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          page === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.page - 2 ||
                    page === pagination.page + 2
                  ) {
                    return <span key={page}>...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn-outline px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
