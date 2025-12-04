const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get brand by ID
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          include: {
            category: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({
      success: true,
      brand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = async (req, res) => {
  try {
    const { name, website } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const logo = req.file ? `/uploads/${req.file.filename}` : null;

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        website,
        logo,
      },
    });

    res.status(201).json({
      success: true,
      brand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, website } = req.body;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    const logo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedBrand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(website && { website }),
        ...(logo && { logo }),
      },
    });

    res.json({
      success: true,
      brand: updatedBrand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await prisma.brand.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
