import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function migrateEquipments() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Equipment = mongoose.model('Equipment', new mongoose.Schema({}, { strict: false }));
    const VehicleEquipment = mongoose.model('VehicleEquipment', new mongoose.Schema({}, { strict: false }));
    const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }));

    // Find equipments without the new contribution fields
    const equipmentsToUpdate = await Equipment.find({
      $or: [
        { isUserContributed: { $exists: false } },
        { status: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${equipmentsToUpdate.length} equipment(s) to update`);

    if (equipmentsToUpdate.length === 0) {
      console.log('✨ All equipments are already up to date!');
      process.exit(0);
    }

    let updated = 0;
    let errors = 0;
    let userContributed = 0;

    for (const equipment of equipmentsToUpdate) {
      try {
        // Try to find who contributed this equipment by looking at VehicleEquipment
        const vehicleEquipment = await VehicleEquipment.findOne({
          equipmentId: equipment._id,
          isCustom: false
        }).sort({ createdAt: 1 }); // Get the oldest one (first user who added it)

        let updateData = {
          status: 'approved', // All existing equipments are approved
        };

        if (vehicleEquipment) {
          // Find the vehicle to get the user
          const vehicle = await Vehicle.findById(vehicleEquipment.vehicleId);
          
          if (vehicle && vehicle.userId) {
            // This was likely contributed by this user
            updateData.isUserContributed = true;
            updateData.contributedBy = vehicle.userId;
            userContributed++;
            console.log(`✅ Updated equipment (user-contributed): ${equipment.name} by user ${vehicle.userId}`);
          } else {
            // No user found, mark as admin-created
            updateData.isUserContributed = false;
            console.log(`✅ Updated equipment (admin): ${equipment.name}`);
          }
        } else {
          // Not linked to any vehicle yet, mark as admin-created
          updateData.isUserContributed = false;
          console.log(`✅ Updated equipment (admin): ${equipment.name}`);
        }

        await Equipment.updateOne(
          { _id: equipment._id },
          { $set: updateData }
        );
        updated++;
      } catch (error) {
        errors++;
        console.error(`❌ Error updating ${equipment.name}:`, error.message);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   👤 User contributions detected: ${userContributed}`);
    console.log(`   👨‍💼 Admin equipments: ${updated - userContributed}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total processed: ${equipmentsToUpdate.length}`);

    await mongoose.connection.close();
    console.log('\n🎉 Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateEquipments();

