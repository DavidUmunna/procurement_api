const mongoose=require("mongoose")
const Users=require("../models/users_")
const purchaseorders=require("../models/PurchaseOrder")
require('dotenv').config({ path: '../.env' });


const OrdersMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const docsToUpdate = await purchaseorders.find();
    const usersList = await Users.find().lean();

    for (let i = 0; i < docsToUpdate.length; i++) {
      const order = docsToUpdate[i];

      order.Approvals.forEach(admin => {
        const matchedUser = usersList.find(user => user.name === admin.admin);
        if (matchedUser) {
          admin.role = matchedUser.role;
        }
      });

      await order.save(); // Save each updated document
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
};

OrdersMigration()