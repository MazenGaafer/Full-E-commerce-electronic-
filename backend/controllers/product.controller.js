const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
      ram,
      storage,
      processor,
      screenSize,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Specification filters
    if (ram || storage || processor || screenSize) {
      where.specifications = {
        some: {
          OR: [
            ...(ram ? [{ key: 'RAM', value: { contains: ram } }] : []),
            ...(storage ? [{ key: 'Storage', value: { contains: storage } }] : []),
            ...(processor ? [{ key: 'Processor', value: { contains: processor } }] : []),
            ...(screenSize ? [{ key: 'Screen Size', value: { contains: screenSize } }] : []),
          ],
        },
      };
    }

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        specifications: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: { [sort]: order },
      skip,
      take: parseInt(limit),
    });

    // Calculate average rating for each product
    const productsWithRating = products.map((product) => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        price: parseFloat(product.price),
        salePrice: product.salePrice ? parseFloat(product.salePrice) : null,
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        reviews: undefined,
      };
    });

    // Get total count
    const total = await prisma.product.count({ where });

    res.json({
      success: true,
      products: productsWithRating,
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

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true },
        },
        images: true,
        specifications: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    res.json({
      success: true,
      product: {
        ...product,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: product.reviews.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      stock,
      sku,
      categoryId,
      brandId,
      featured,
      specifications,
      ram,
      storage,
      processor,
      graphicsCard,
      screenSize,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !categoryId || !brandId || stock === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, price, categoryId, brandId, stock' 
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Auto-generate SKU if not provided
    const productSku = sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Handle uploaded images
    const images = req.files ? req.files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      alt: name,
      isPrimary: index === 0,
    })) : [];

    // Build specifications array from individual fields or JSON
    let specs = [];
    
    if (specifications) {
      // If specifications are provided as JSON string
      specs = typeof specifications === 'string' 
        ? JSON.parse(specifications) 
        : specifications;
    } else {
      // Build from individual fields
      if (ram) specs.push({ key: 'RAM', value: ram });
      if (storage) specs.push({ key: 'Storage', value: storage });
      if (processor) specs.push({ key: 'Processor', value: processor });
      if (graphicsCard) specs.push({ key: 'Graphics Card', value: graphicsCard });
      if (screenSize) specs.push({ key: 'Screen Size', value: screenSize });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock),
        sku: productSku,
        categoryId: parseInt(categoryId),
        brandId: parseInt(brandId),
        featured: featured === 'true' || featured === true,
        images: {
          create: images,
        },
        specifications: {
          create: specs,
        },
      },
      include: {
        category: true,
        brand: true,
        images: true,
        specifications: true,
      },
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      salePrice,
      stock,
      categoryId,
      brandId,
      featured,
      specifications,
    } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: name || product.name,
        isPrimary: index === 0,
        productId: parseInt(id),
      }));

      await prisma.productImage.createMany({
        data: newImages,
      });
    }

    // Update specifications if provided
    if (specifications) {
      const specs = typeof specifications === 'string' 
        ? JSON.parse(specifications) 
        : specifications;

      // Delete old specifications
      await prisma.productSpecification.deleteMany({
        where: { productId: parseInt(id) },
      });

      // Create new specifications
      await prisma.productSpecification.createMany({
        data: specs.map((spec) => ({
          ...spec,
          productId: parseInt(id),
        })),
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(brandId && { brandId: parseInt(brandId) }),
        ...(featured !== undefined && { featured: featured === 'true' || featured === true }),
      },
      include: {
        category: true,
        brand: true,
        images: true,
        specifications: true,
      },
    });

    res.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Compare products
// @route   GET /api/products/compare?ids=1,2,3
// @access  Public
const compareProducts = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    const productIds = ids.split(',').map((id) => parseInt(id));

    if (productIds.length > 3) {
      return res.status(400).json({ message: 'Maximum 3 products can be compared' });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        specifications: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Calculate average ratings
    const productsWithRating = products.map((product) => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        reviews: undefined,
      };
    });

    res.json({
      success: true,
      products: productsWithRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      include: {
        category: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        reviews: {
          select: { rating: true },
        },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    const productsWithRating = products.map((product) => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        reviews: undefined,
      };
    });

    res.json({
      success: true,
      products: productsWithRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  compareProducts,
  getFeaturedProducts,
};
