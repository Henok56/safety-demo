const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChangeHistorySchema = new Schema(
  {
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changes: Schema.Types.Mixed
  },
  { _id: false }
);

const OccurrenceSchema = new Schema(
  {
    spi: { type: String, required: true },
    taxonomyCategoryL4: String,
    taxonomyName: String,
    occurrenceDate: { type: Date, required: true },
    aircraftModel: { type: String, required: true },
    departureAirport: String,
    arrivalAirport: String,
    occurrenceLocation: String,
    eventDescription: { type: String, required: true },
    aircraftRegistrationNumber: { type: String, required: true },
    flightPhase: { type: String, required: true },
    reportSource: { type: String },
    riskRating: String,
    responsibleDivision: String,
    responsibleSection: String,
    statusCategory: String,
    documentationStatus: String,
    remarksEvidence: String,
    investigationTitle: String,
    investigationCompletionDate: Date,
    primaryCauses: String,
    contributingFactors: String,
    findings: String,
    numberOfRecommendations: { type: Number, default: 0 },
    recommendationsList: String,
    releaseDate: Date,
    recommendationDueDate: Date,
    closureStatus: String,
    closedDate: Date,
    effectivenessReviewDate: Date,
    effectivenessStatus: String,
    numberOfOccurrence: { type: Number, default: 1 },
    createdBy: { type: String, required: true },
    updatedBy: String,
    changeHistory: [ChangeHistorySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Occurrence || mongoose.model("Occurrence", OccurrenceSchema);
