require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  const localURI = 'mongodb://localhost:27017/grozo';
  const atlasURI = process.argv[2];
  
  if (!atlasURI || !atlasURI.startsWith('mongodb+srv')) {
    console.error('❌ Please provide your valid MongoDB Atlas URI as an argument.');
    console.log('Usage: node server/migrate.js "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/grozo?retryWrites=true&w=majority"');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to local database...');
    const localDb = await mongoose.createConnection(localURI).asPromise();
    console.log('✅ Connected to local DB');
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    const atlasDb = await mongoose.createConnection(atlasURI).asPromise();
    console.log('✅ Connected to Atlas DB');

    const collections = await localDb.db.listCollections().toArray();
    
    for (let collection of collections) {
      const colName = collection.name;
      console.log(`\n📦 Reading collection: ${colName}...`);
      
      const docs = await localDb.db.collection(colName).find({}).toArray();
      
      if (docs.length > 0) {
        console.log(`   Found ${docs.length} documents. Transferring to Atlas...`);
        // Clear existing in atlas to avoid duplicates
        await atlasDb.db.collection(colName).deleteMany({});
        // Insert
        await atlasDb.db.collection(colName).insertMany(docs);
        console.log(`   ✅ Successfully migrated ${colName}`);
      } else {
        console.log(`   ⏭️ Skipped ${colName} (empty)`);
      }
    }
    
    console.log('\n🎉 ALL DATA MIGRATED SUCCESSFULLY! 🎉');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
