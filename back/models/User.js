const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    userid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔒 never return password
    },

    role: {
      type: String,
      enum: [
        "user",
        "superadmin",
        "manager",
        "team_leader",
        "fdm_officer",
        "scheduler",
      ],
      default: "user",
      index: true,
    },

    employeeProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      unique: true,
      sparse: true,
    },

    specialPermissions: {
      type: [String],
      default: [],
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// 🔐 HASH PASSWORD BEFORE SAVE
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 COMPARE PASSWORD
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);