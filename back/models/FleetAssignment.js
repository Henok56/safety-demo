const mongoose = require("mongoose");

const fleetAssignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    fleetFamily: {
      type: String,
      enum: ["Q-400", "B-737", "B-777", "B-787", "B-767", "A-350"],
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "fleetassignments",
  }
);

// ======================================================
// AUTO-POPULATE userId FROM EMPLOYEE
// ======================================================
fleetAssignmentSchema.pre("save", async function () {
  const Employee = require("./Employee.model");

  // Auto-populate userId from employee.userAccount if not already set
  if (this.employeeId && !this.userId) {
    const employee = await Employee.findById(this.employeeId);
    if (employee) {
      this.userId = employee.userAccount || null;
    }
  }
});

module.exports = mongoose.model("FleetAssignment", fleetAssignmentSchema);