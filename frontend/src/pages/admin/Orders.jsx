import { useEffect, useState } from 'react';
import { Search, Eye, X, Clock, CheckCircle, AlertCircle, Package, Truck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await API.get(`/orders?${params.toString()}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Unable to load orders. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdatingStatus(true);
    try {
      await API.put(`/orders/${selectedOrder.id}/status`, { status: newStatus });
      toast.success('Order status updated successfully!');
      closeModal();
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Unable to update order status. Please try again later.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', icon: BarChart3 },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
    };
    return badges[status] || badges.PENDING;
  };

  const getStatusStats = () => {
    return statuses.map(status => ({
      status,
      count: orders.filter(o => o.status === status).length,
      badge: getStatusBadge(status),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {getStatusStats().map(({ status, count, badge }) => {
          const Icon = badge.icon;
          return (
            <div
              key={status}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${badge.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${badge.text}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`text-xs font-semibold ${badge.text} uppercase`}>{status}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map(order => {
                  const statusBadge = getStatusBadge(order.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-primary-600">
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
                        <span className="text-sm text-gray-700">
                          {order.items?.length || 0} item(s)
                        </span>
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
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openModal(order)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Update Order Status</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <span className="font-mono font-semibold text-gray-900">#{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium text-gray-900">{selectedOrder.user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-bold text-primary-600">${selectedOrder.totalPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getStatusBadge(selectedOrder.status).bg
                  } ${getStatusBadge(selectedOrder.status).text}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">New Status</label>
                <div className="grid grid-cols-1 gap-3">
                  {statuses.map(status => {
                    const badge = getStatusBadge(status);
                    const Icon = badge.icon;
                    return (
                      <label
                        key={status}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          newStatus === status
                            ? `border-primary-500 ${badge.bg}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={newStatus === status}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <div className={`w-10 h-10 rounded-lg ${badge.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${badge.text}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{status}</p>
                          <p className="text-xs text-gray-500">
                            {status === 'PENDING' && 'Waiting for processing'}
                            {status === 'PROCESSING' && 'Order is being prepared'}
                            {status === 'SHIPPED' && 'Package is on the way'}
                            {status === 'DELIVERED' && 'Successfully delivered'}
                            {status === 'CANCELLED' && 'Order cancelled'}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === selectedOrder.status}
                  className="btn-primary disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
