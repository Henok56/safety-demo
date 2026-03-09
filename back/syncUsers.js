const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Employee = require("./models/Employee.model");

const powerSync = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  
  for (const user of users) {
    // Force username to string and trim
    const searchId = String(user.username).trim();

    // Search for employee by matching the string version of regNo
    const employee = await Employee.findOne({
      $expr: {
        $eq: [{ $toString: "$regNo" }, searchId]
      }
    });

    if (employee) {
      user.employeeProfile = employee._id;
      await user.save();
      console.log(`✅ LINKED: ${searchId} to ${employee.firstName}`);
    } else {
      console.log(`❌ STILL MISSING: ${searchId} - Check if this ID exists in Employee table`);
    }
  }
  process.exit();
};
powerSync();