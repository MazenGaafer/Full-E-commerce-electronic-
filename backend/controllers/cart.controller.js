const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            brand: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + parseFloat(price) * item.quantity;
    }, 0);

    res.json({
      success: true,
      cart: {
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId),
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + parseInt(quantity);

      if (product.stock < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              brand: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      });

      return res.json({
        success: true,
        cartItem: updatedItem,
      });
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
      },
      include: {
        product: {
          include: {
            brand: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      cartItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId),
        },
      },
      include: { product: true },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.product.stock < parseInt(quantity)) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: parseInt(quantity) },
      include: {
        product: {
          include: {
            brand: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    res.json({
      success: true,
      cartItem: updatedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId),
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
