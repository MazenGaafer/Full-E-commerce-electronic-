import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();

  const categories = [
    { name: 'Smartphones', slug: 'smartphones' },
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Tablets', slug: 'tablets' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            ElectroShop
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            {isAuthenticated && (
              <Link to="/cart" className="relative hover:text-primary-600">
                <ShoppingCart className="w-6 h-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg border border-gray-200 hidden group-hover:block z-50">
                  <div className="p-3 border-b bg-gradient-to-r from-primary-50 to-blue-50">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">My Profile</p>
                      <p className="text-xs text-gray-500">Account settings</p>
                    </div>
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">My Orders</p>
                      <p className="text-xs text-gray-500">Track purchases</p>
                    </div>
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Admin Panel</p>
                        <p className="text-xs text-gray-500">Manage store</p>
                      </div>
                    </Link>
                  )}
                  <button 
                    onClick={logout} 
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 transition-colors border-t text-red-600"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Logout</p>
                      <p className="text-xs text-gray-400">Sign out</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <nav className="hidden md:flex space-x-6 mt-4 border-t pt-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="text-gray-700 hover:text-primary-600 font-medium"
            >
              {category.name}
            </Link>
          ))}
          <Link to="/compare" className="text-gray-700 hover:text-primary-600 font-medium">
            Compare
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="block py-2 text-gray-700 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
