const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true, 
    // ✅ Expanded enum to include all four talent management categories
    enum: [
      "Recurrent Training", 
      "Career Development", 
      "Coaching", 
      "Leadership Development"
    ] 
  },
  topic: { 
    type: String, 
    required: true,
    trim: true // Recommended to prevent leading/trailing spaces in topics
  }
}, { timestamps: true });

// Optional: Ensure the same topic isn't added twice in the same category
trainingSchema.index({ category: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model("Training", trainingSchema);