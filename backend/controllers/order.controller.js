const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { normalizeOrderItems } = require('../utils/quantity');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      phone,
      paymentMethod,
      notes,
    } = req.body;

    const normalizedItems = normalizeOrderItems(items);
    if (typeof shippingAddress !== 'string' || !shippingAddress.trim() ||
        typeof phone !== 'string' || !phone.trim() ||
        typeof paymentMethod !== 'string' || !paymentMethod.trim()) {
      return res.status(400).json({ message: 'Shipping address, phone and payment method are required' });
    }

    // Order, stock reservation and cart cleanup either commit together or roll back.
    const order = await prisma.$transaction(async (tx) => {
      let itemsPrice = 0;
      const orderItems = [];
      for (const item of normalizedItems) {
        // Conditional atomic update prevents concurrent orders from overselling.
        const reserved = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (reserved.count !== 1) {
          throw Object.assign(new Error('Product unavailable or insufficient stock'), { status: 400 });
        }
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { images: { where: { isPrimary: true }, take: 1 } },
        });
        const price = product.salePrice ?? product.price;
        itemsPrice += Number(price) * item.quantity;
        orderItems.push({ productId: product.id, name: product.name,
          image: product.images[0]?.url || null, price, quantity: item.quantity });
      }
      const taxPrice = Math.round(itemsPrice * 10) / 100;
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;
      const created = await tx.order.create({
        data: { orderNumber: generateOrderNumber(), userId: req.user.id,
          items: { create: orderItems }, shippingAddress, phone, paymentMethod, notes,
          itemsPrice, taxPrice, shippingPrice, totalPrice },
        include: { items: { include: { product: true } } },
      });
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
      return created;
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Server error' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
};
