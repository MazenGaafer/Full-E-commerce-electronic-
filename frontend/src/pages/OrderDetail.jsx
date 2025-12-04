import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Unable to load order details. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'PROCESSING':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'SHIPPED':
        return <Truck className="w-6 h-6 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'PENDING', label: 'Order Placed' },
      { status: 'PROCESSING', label: 'Processing' },
      { status: 'SHIPPED', label: 'Shipped' },
      { status: 'DELIVERED', label: 'Delivered' },
    ];

    const currentIndex = steps.findIndex(step => step.status === order?.status);
    return { steps, currentIndex };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-600">Order not found</p>
        <Link to="/orders" className="btn-primary mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const { steps, currentIndex } = getStatusSteps();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link to="/orders" className="text-primary-600 hover:underline mb-2 inline-block">
            &larr; Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className={`mt-4 md:mt-0 px-6 py-3 rounded-lg border-2 flex items-center gap-3 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-bold text-lg">{order.status}</span>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        {order.status !== 'CANCELLED' && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Order Progress</h2>
            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
                <div
                  className="h-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
                        index <= currentIndex
                          ? 'border-primary-600 text-primary-600'
                          : 'border-gray-300 text-gray-300'
                      }`}
                    >
                      {index < currentIndex ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : index === currentIndex ? (
                        getStatusIcon(step.status)
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      )}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${
                      index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Order Items ({itemCount})</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold hover:text-primary-600 block mb-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                      <p className="text-lg font-bold text-primary-600">${item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>{order.phone}</span>
                </div>
                {order.user?.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{order.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Order Notes</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${order.itemsPrice}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">${order.taxPrice}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {parseFloat(order.shippingPrice) === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${order.shippingPrice}`
                    )}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">${order.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-semibold capitalize">{order.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {order.status === 'DELIVERED' && (
                <div className="mt-6 pt-6 border-t space-y-3">
                  <Link to="/products" className="btn-primary w-full text-center block">
                    Shop Again
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
