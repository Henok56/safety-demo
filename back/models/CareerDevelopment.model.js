const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  // Store the topic name as a string (as selected in your React dropdown)
  topic: { type: String, required: true }, 

  // Add these back so the payload doesn't fail validation
  lastPromotionDate: { type: Date },
  nextPromotionDate: { type: Date },
  
  tentativeScheduleMonth: { type: String }, 
  remark: { 
    type: String, 
    enum: ["pending", "taken"], 
    default: "pending" 
  },
  category: { type: String, default: "Career Development" }, 
  costCenter: { type: String }, // Added to match your handleEmployeeAutoFill
  
  createdBy: { type: String },
  lastModifiedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.CareerDevelopment || mongoose.model("CareerDevelopment", careerSchema);