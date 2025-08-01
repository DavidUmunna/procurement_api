const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const SkipTracking = require('./models/skips_tracking'); // update the path

mongoose.connect('mongodb://localhost:27017/Haldenresources', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const results = [];

fs.createReadStream(path.join(__dirname, 'SkipsMigrationData.csv'))
  .pipe(csv())
  .on('data', (row) => {
    // Transform CSV row into schema-compatible object
    results.push({
      skip_id: row.skip_id,
      DeliveryWaybillNo: Number(row.DeliveryWaybillNo),
      DateMobilized: new Date(row.DateMobilized),
      DateReceivedOnLocation: row.DateReceivedOnLocation === 'NA' ? null : new Date(row.DateReceivedOnLocation),
      SkipsTruckRegNo: row.SkipsTruckRegNo,
      SkipsTruckDriver: row.SkipsTruckDriver,
      WasteStream:row.WasteStream,
      WasteSource:row.WasteSource
    
    });
  })
  .on('end', async () => {
    try {
      const inserted = await SkipTracking.insertMany(results);
      console.log(`Inserted ${inserted.length} documents`);
    } catch (err) {
      console.error('Error inserting documents:', err);
    } finally {
      mongoose.disconnect();
    }
  });
