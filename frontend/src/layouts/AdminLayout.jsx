import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Grid, 
  LogOut,
  Settings,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'bg-blue-100 text-blue-600' },
    { name: 'Products', href: '/admin/products', icon: Package, color: 'bg-green-100 text-green-600' },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, color: 'bg-purple-100 text-purple-600' },
    { name: 'Categories', href: '/admin/categories', icon: Grid, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Brands', href: '/admin/brands', icon: Tag, color: 'bg-pink-100 text-pink-600' },
    { name: 'Users', href: '/admin/users', icon: Users, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-xl min-h-screen border-r border-gray-200 relative">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-primary-100">Store Management</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Menu</p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-between px-4 py-3 mb-2 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-primary-100' : item.color
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-primary-700' : ''
                      }`} />
                    </div>
                    <span className={`font-medium ${
                      isActive ? 'font-semibold' : ''
                    }`}>
                      {item.name}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-6 px-3">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-medium">View Store</span>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium">Add Product</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="mt-6 px-3 pb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Logout</p>
                <p className="text-xs text-gray-500">Sign out of admin panel</p>
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
