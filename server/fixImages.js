require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const https = require('https');
const Product = require('./models/Product');

const checkUrl = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => {
      resolve(500);
    });
  });
};

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    const products = await Product.find({});
    let fixedCount = 0;

    for (const p of products) {
      if (!p.images || p.images.length === 0 || !p.images[0].url) {
        p.images = [{ url: 'https://placehold.co/400x400/e2e8f0/1e293b?text=Product', alt: p.name }];
        await p.save();
        fixedCount++;
        console.log(`Fixed missing image for: ${p.name}`);
        continue;
      }

      const url = p.images[0].url;
      const status = await checkUrl(url);
      
      if (status !== 200) {
        console.log(`Broken image (status ${status}) for ${p.name}: ${url}`);
        p.images[0].url = `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(p.name)}`;
        await p.save();
        fixedCount++;
      }
    }

    console.log(`\nFinished checking images. Fixed ${fixedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixImages();
