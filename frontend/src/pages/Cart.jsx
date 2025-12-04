import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const Cart = () => {
  const navigate = useNavigate();
  const { items, loading, fetchCart, updateQuantity, removeItem, getTotal, getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
      toast.success('Quantity updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateItemTotal = (item) => {
    const price = item.product.salePrice || item.product.price;
    return (parseFloat(price) * item.quantity).toFixed(2);
  };

  const subtotal = getTotal();
  const tax = (subtotal * 0.1).toFixed(2); // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = (parseFloat(subtotal) + parseFloat(tax) + shipping).toFixed(2);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{getItemCount()} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              const price = product.salePrice || product.price;
              const image = product.images?.[0]?.url || '/placeholder.jpg';

              return (
                <div key={item.id} className="card p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="flex-shrink-0">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">{product.brand?.name}</p>
                          <Link
                            to={`/products/${product.id}`}
                            className="font-semibold hover:text-primary-600 block mb-2"
                          >
                            {product.name}
                          </Link>
                          
                          {/* Price */}
                          <div className="mb-3">
                            {product.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-primary-600">${product.salePrice}</span>
                                <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-primary-600">${product.price}</span>
                            )}
                          </div>

                          {/* Stock Status */}
                          {product.stock < item.quantity && (
                            <p className="text-sm text-red-600 mb-2">
                              Only {product.stock} left in stock
                            </p>
                          )}
                          {product.stock === 0 && (
                            <p className="text-sm text-red-600 font-semibold mb-2">
                              Out of stock
                            </p>
                          )}
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${calculateItemTotal(item)}</p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(product.id, item.quantity - 1)}
                            disabled={updating === product.id || item.quantity <= 1}
                            className="btn-outline px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {updating === product.id ? (
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(product.id, item.quantity + 1)}
                            disabled={updating === product.id || item.quantity >= product.stock}
                            className="btn-outline px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(product.id)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">${tax}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {subtotal < 100 && shipping > 0 && (
                  <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">${total}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="btn-outline w-full text-center block"
              >
                Continue Shopping
              </Link>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* You can add recommended products here */}
            <p className="col-span-full text-gray-600 text-center py-8">Recommended products coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
