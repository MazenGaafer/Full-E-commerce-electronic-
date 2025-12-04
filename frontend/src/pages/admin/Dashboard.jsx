import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        API.get('/orders?limit=5'),
        API.get('/products?limit=1'),
        API.get('/users?limit=1'),
      ]);

      const orders = ordersRes.data.orders || [];
      const allOrdersCount = ordersRes.data.pagination?.total || 0;
      const productsCount = productsRes.data.pagination?.total || 0;
      const usersCount = usersRes.data.pagination?.total || 0;

      // Calculate stats
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);
      const pending = orders.filter(o => o.status === 'PENDING').length;
      const delivered = orders.filter(o => o.status === 'DELIVERED').length;

      setStats({
        totalRevenue: revenue,
        totalOrders: allOrdersCount,
        totalProducts: productsCount,
        totalUsers: usersCount,
        pendingOrders: pending,
        deliveredOrders: delivered,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Unable to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      change: '+12.5%',
      isIncrease: true,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+8.2%',
      isIncrease: true,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      change: '+4.1%',
      isIncrease: true,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      change: '+15.3%',
      isIncrease: true,
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', icon: BarChart3 },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
    };
    return badges[status] || badges.PENDING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
        <p className="text-primary-100">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  stat.isIncrease ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.isIncrease ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-xs font-semibold">{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivered Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">24.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-600 mt-1">Latest customer orders</p>
            </div>
            <Link to="/admin/orders" className="btn-primary">
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{order.user?.name}</p>
                          <p className="text-sm text-gray-500">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-primary-600">${order.totalPrice}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          statusBadge.bg
                        } ${statusBadge.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/orders/${order.id}`}
                          className="link"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/products" className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-2 border-gray-200 hover:border-primary-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-600">Add or edit products</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/orders" className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-2 border-gray-200 hover:border-primary-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">View Orders</p>
              <p className="text-sm text-gray-600">Manage customer orders</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/users" className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-2 border-gray-200 hover:border-primary-300 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View all customers</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
