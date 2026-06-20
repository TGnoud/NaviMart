const mongoose = require('mongoose');

const uri = "mongodb+srv://duongevil123_db_user:TnIrhdn1BSKoBD44@vn-jp-connect.eraedra.mongodb.net/navimart?appName=VN-JP-CONNECT";

async function run() {
  await mongoose.connect(uri, { dbName: 'navimart' });
  console.log('Connected to DB');

  const db = mongoose.connection.db;
  const events = await db.collection('inventoryEvents').find({
    type: 'wasted'
  }).sort({ createdAt: -1 }).toArray();

  console.log(`Found ${events.length} wasted events:`);
  for (const event of events) {
    console.log(`- Name: ${event.name}, Delta: ${event.quantityDelta}, After: ${event.quantityAfter}, CreatedAt: ${event.createdAt}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
