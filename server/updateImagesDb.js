require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');

const updateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const updates = [
      { name: 'Organic Tomatoes', url: '/images/organic_tomatoes.png' },
      { name: 'White Bread', url: '/images/white_bread.png' },
      { name: 'Surf Excel Detergent', url: '/images/surf_excel.png' },
      { name: 'Potatoes', url: '/images/potatoes.png' },
      { name: 'Kurkure Masala Munch', url: '/images/kurkure.png' },
      { name: 'Rasgulla', url: '/images/rasgulla.png' },
      { name: 'Dettol Handwash', url: '/images/dettol.png' },
      { name: 'Sugar', url: '/images/sugar.png' },
      { name: 'Chia Seeds', url: '/images/chia_seeds.png' },
      { name: 'Multigrain Bread', url: '/images/multigrain_bread.png' }
    ];

    let fixedCount = 0;
    for (const update of updates) {
      const product = await Product.findOne({ name: update.name });
      if (product) {
        product.images = [{ url: update.url, alt: update.name }];
        await product.save();
        fixedCount++;
        console.log(`Updated image for ${update.name} to ${update.url}`);
      }
    }

    console.log(`\nSuccessfully updated ${fixedCount} product images in the database.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateImages();
