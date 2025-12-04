const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@electronics.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@electronics.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created');

  // Create Categories
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'smartphones' },
      update: {},
      create: {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Latest smartphones from top brands',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'laptops' },
      update: {},
      create: {
        name: 'Laptops & PCs',
        slug: 'laptops',
        description: 'Powerful laptops and desktop computers',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tablets' },
      update: {},
      create: {
        name: 'Tablets',
        slug: 'tablets',
        description: 'iPads and Android tablets',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'gaming' },
      update: {},
      create: {
        name: 'Gaming Consoles',
        slug: 'gaming',
        description: 'PlayStation, Xbox, Nintendo Switch',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Chargers, cables, headphones, and more',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create Brands
  console.log('Creating brands...');
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'apple' },
      update: {},
      create: {
        name: 'Apple',
        slug: 'apple',
        website: 'https://www.apple.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'samsung' },
      update: {},
      create: {
        name: 'Samsung',
        slug: 'samsung',
        website: 'https://www.samsung.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'hp' },
      update: {},
      create: {
        name: 'HP',
        slug: 'hp',
        website: 'https://www.hp.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'dell' },
      update: {},
      create: {
        name: 'Dell',
        slug: 'dell',
        website: 'https://www.dell.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'sony' },
      update: {},
      create: {
        name: 'Sony',
        slug: 'sony',
        website: 'https://www.sony.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'microsoft' },
      update: {},
      create: {
        name: 'Microsoft',
        slug: 'microsoft',
        website: 'https://www.microsoft.com',
      },
    }),
  ]);

  console.log('✅ Brands created');

  // Create Sample Products
  console.log('Creating sample products...');

  // iPhone 15 Pro
  await prisma.product.upsert({
    where: { sku: 'IPH15PRO256' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'The latest iPhone featuring the powerful A17 Pro chip, titanium design, and advanced camera system.',
      price: 999,
      salePrice: 949,
      stock: 50,
      sku: 'IPH15PRO256',
      featured: true,
      categoryId: categories[0].id, // Smartphones
      brandId: brands[0].id, // Apple
      specifications: {
        create: [
          { key: 'Processor', value: 'A17 Pro chip', group: 'Performance' },
          { key: 'RAM', value: '8GB', group: 'Performance' },
          { key: 'Storage', value: '256GB', group: 'Storage' },
          { key: 'Screen Size', value: '6.1 inches', group: 'Display' },
          { key: 'Display Type', value: 'Super Retina XDR OLED', group: 'Display' },
          { key: 'Resolution', value: '2556 x 1179 pixels', group: 'Display' },
          { key: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto', group: 'Camera' },
          { key: 'Front Camera', value: '12MP TrueDepth', group: 'Camera' },
          { key: 'Battery', value: 'Up to 23 hours video playback', group: 'Battery' },
          { key: 'Operating System', value: 'iOS 17', group: 'Software' },
          { key: '5G', value: 'Yes', group: 'Connectivity' },
          { key: 'Weight', value: '187g', group: 'Design' },
        ],
      },
    },
  });

  // Samsung Galaxy S23 Ultra
  await prisma.product.upsert({
    where: { sku: 'SAMS23U512' },
    update: {},
    create: {
      name: 'Samsung Galaxy S23 Ultra',
      slug: 'samsung-galaxy-s23-ultra',
      description: 'Premium Android smartphone with S Pen, 200MP camera, and stunning display.',
      price: 1199,
      stock: 35,
      sku: 'SAMS23U512',
      featured: true,
      categoryId: categories[0].id,
      brandId: brands[1].id, // Samsung
      specifications: {
        create: [
          { key: 'Processor', value: 'Snapdragon 8 Gen 2', group: 'Performance' },
          { key: 'RAM', value: '12GB', group: 'Performance' },
          { key: 'Storage', value: '512GB', group: 'Storage' },
          { key: 'Screen Size', value: '6.8 inches', group: 'Display' },
          { key: 'Display Type', value: 'Dynamic AMOLED 2X', group: 'Display' },
          { key: 'Camera', value: '200MP Main + 12MP Ultra Wide + 10MP Telephoto (3x) + 10MP Telephoto (10x)', group: 'Camera' },
          { key: 'Battery', value: '5000mAh', group: 'Battery' },
          { key: 'Operating System', value: 'Android 13', group: 'Software' },
          { key: 'S Pen', value: 'Included', group: 'Features' },
        ],
      },
    },
  });

  // Dell XPS 15
  await prisma.product.upsert({
    where: { sku: 'DELLXPS1513' },
    update: {},
    create: {
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      description: 'Premium laptop with stunning InfinityEdge display and powerful performance.',
      price: 1899,
      salePrice: 1699,
      stock: 20,
      sku: 'DELLXPS1513',
      featured: true,
      categoryId: categories[1].id, // Laptops
      brandId: brands[3].id, // Dell
      specifications: {
        create: [
          { key: 'Processor', value: 'Intel Core i7-13700H', group: 'Performance' },
          { key: 'RAM', value: '16GB DDR5', group: 'Performance' },
          { key: 'Storage', value: '512GB SSD', group: 'Storage' },
          { key: 'Graphics Card', value: 'NVIDIA GeForce RTX 4050', group: 'Graphics' },
          { key: 'Screen Size', value: '15.6 inches', group: 'Display' },
          { key: 'Display Type', value: 'FHD+ (1920 x 1200) InfinityEdge', group: 'Display' },
          { key: 'Battery', value: 'Up to 13 hours', group: 'Battery' },
          { key: 'Operating System', value: 'Windows 11 Pro', group: 'Software' },
          { key: 'Weight', value: '1.86kg', group: 'Design' },
        ],
      },
    },
  });

  // iPad Pro
  await prisma.product.upsert({
    where: { sku: 'IPADPRO11' },
    update: {},
    create: {
      name: 'iPad Pro 11-inch',
      slug: 'ipad-pro-11',
      description: 'Powerful tablet with M2 chip and stunning Liquid Retina display.',
      price: 799,
      stock: 45,
      sku: 'IPADPRO11',
      featured: true,
      categoryId: categories[2].id, // Tablets
      brandId: brands[0].id, // Apple
      specifications: {
        create: [
          { key: 'Processor', value: 'Apple M2 chip', group: 'Performance' },
          { key: 'RAM', value: '8GB', group: 'Performance' },
          { key: 'Storage', value: '128GB', group: 'Storage' },
          { key: 'Screen Size', value: '11 inches', group: 'Display' },
          { key: 'Display Type', value: 'Liquid Retina', group: 'Display' },
          { key: 'Camera', value: '12MP Wide + 10MP Ultra Wide', group: 'Camera' },
          { key: 'Battery', value: 'Up to 10 hours', group: 'Battery' },
          { key: 'Operating System', value: 'iPadOS 17', group: 'Software' },
          { key: 'Apple Pencil', value: 'Compatible with 2nd generation', group: 'Features' },
        ],
      },
    },
  });

  // PlayStation 5
  await prisma.product.upsert({
    where: { sku: 'PS5CONSOLE' },
    update: {},
    create: {
      name: 'PlayStation 5',
      slug: 'playstation-5',
      description: 'Next-gen gaming console with 4K gaming and ultra-fast SSD.',
      price: 499,
      stock: 30,
      sku: 'PS5CONSOLE',
      featured: true,
      categoryId: categories[3].id, // Gaming
      brandId: brands[4].id, // Sony
      specifications: {
        create: [
          { key: 'Processor', value: 'AMD Ryzen Zen 2', group: 'Performance' },
          { key: 'Graphics Card', value: 'AMD Radeon RDNA 2', group: 'Graphics' },
          { key: 'RAM', value: '16GB GDDR6', group: 'Performance' },
          { key: 'Storage', value: '825GB SSD', group: 'Storage' },
          { key: 'Resolution', value: 'Up to 4K @ 120Hz', group: 'Display' },
          { key: 'Ray Tracing', value: 'Yes', group: 'Graphics' },
          { key: 'Optical Drive', value: 'Ultra HD Blu-ray', group: 'Features' },
        ],
      },
    },
  });

  console.log('✅ Sample products created');
  console.log('✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
