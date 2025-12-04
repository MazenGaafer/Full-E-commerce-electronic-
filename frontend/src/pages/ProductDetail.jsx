import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useCompareStore from '../store/compareStore';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const { addToCart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToCompare } = useCompareStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      toast.success('Added to cart!');
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToCompare = () => {
    try {
      addToCompare(product);
      toast.success('Added to comparison');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }

    try {
      await API.post('/reviews', {
        productId: product.id,
        rating,
        comment: reviewText,
      });
      toast.success('Review submitted!');
      setReviewText('');
      setRating(5);
      fetchProduct();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-600">Product not found</p>
        <Link to="/products" className="btn-primary mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [{ url: '/placeholder.jpg', alt: product.name }];
  const specs = product.specifications || [];
  const reviews = product.reviews || [];

  // Group specifications by group
  const groupedSpecs = specs.reduce((acc, spec) => {
    const group = spec.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(spec);
    return acc;
  }, {});

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <div className="card mb-4">
              <div className="aspect-square bg-gray-200 overflow-hidden">
                <img
                  src={images[selectedImage]?.url}
                  alt={images[selectedImage]?.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`card p-0 overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-primary-600' : ''
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover aspect-square" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="card p-6">
              <p className="text-sm text-gray-600 mb-2">{product.brand?.name}</p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.averageRating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.salePrice ? (
                  <>
                    <span className="text-4xl font-bold text-primary-600">${product.salePrice}</span>
                    <span className="text-2xl text-gray-500 line-through ml-4">${product.price}</span>
                    <span className="ml-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      Save ${(parseFloat(product.price) - parseFloat(product.salePrice)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-primary-600">${product.price}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-semibold">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn-outline px-4 py-2"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center input-field"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="btn-outline px-4 py-2"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button onClick={handleAddToCompare} className="btn-outline px-6">
                  Compare
                </button>
              </div>

              {/* Category */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Category:</span>{' '}
                  <Link to={`/products?category=${product.category?.slug}`} className="text-primary-600 hover:underline">
                    {product.category?.name}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {Object.keys(groupedSpecs).length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
            {Object.entries(groupedSpecs).map(([group, specs]) => (
              <div key={group} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold mb-3 text-primary-600">{group}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-700">{spec.key}</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {/* Review Form */}
          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  className="w-full input-field"
                  placeholder="Share your thoughts about this product..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-primary">
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {review.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{review.user?.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && <p className="font-semibold mb-2">{review.title}</p>}
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
