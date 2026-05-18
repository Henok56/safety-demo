const mongoose = require('mongoose');

const cultureComplianceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  aspects: {
    teamwork: { score: { type: Number, default: 0 }, comment: String },
    respect: { score: { type: Number, default: 0 }, comment: String },
    discipline: { score: { type: Number, default: 0 }, comment: String },
    grooming: { score: { type: Number, default: 0 }, comment: String },
    appearance: { score: { type: Number, default: 0 }, comment: String },
    bureaucracy: { score: { type: Number, default: 0 }, comment: String },
    indifference: { score: { type: Number, default: 0 }, comment: String }
  },
  penalties: [{
    aspect: { type: String, trim: true },
    type: { type: String, trim: true, default: 'warning' },
    reason: { type: String, required: true },
    impactValue: { type: Number, required: true, default: 0 },
    severity: { type: Number, min: 1, max: 5, default: 1 },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issuedDate: { type: Date, default: Date.now }
  }],
  aspectHistory: [{
    aspect: { type: String, trim: true, required: true },
    score: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recordedAt: { type: Date, default: Date.now }
  }],
  overallScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['excellent', 'good', 'needs_improvement', 'poor', 'critical'],
    default: 'needs_improvement'
  }
}, { timestamps: true });

cultureComplianceSchema.pre('save', function () {
  const aspectTotals = {
    teamwork: 0,
    respect: 0,
    discipline: 0,
    grooming: 0,
    appearance: 0,
    bureaucracy: 0,
    indifference: 0
  };

  // Calculate from HISTORY
  (this.aspectHistory || []).forEach(entry => {
    if (aspectTotals.hasOwnProperty(entry.aspect)) {
      aspectTotals[entry.aspect] += entry.score || 0;
    }
  });

  // Update aspects from totals
  Object.keys(aspectTotals).forEach(key => {
    this.aspects[key] = {
      score: aspectTotals[key],
      comment: ""
    };
  });

  // Base score from computed totals
  const baseScore = Object.values(aspectTotals).reduce((sum, val) => sum + val, 0);

  // Apply penalties/rewards
  const modifiers = (this.penalties || []).reduce(
    (acc, curr) => acc + (curr.impactValue || 0),
    0
  );

  this.overallScore = baseScore + modifiers;

  // Set status
  if (this.overallScore >= 50) this.status = 'excellent';
  else if (this.overallScore >= 20) this.status = 'good';
  else if (this.overallScore >= 0) this.status = 'needs_improvement';
  else if (this.overallScore >= -30) this.status = 'poor';
  else this.status = 'critical';
});

module.exports = mongoose.models.CultureCompliance || mongoose.model('CultureCompliance', cultureComplianceSchema);