// controllers/talents.controller.js
const Employee = require("../models/Employee.model");
const CareerDevelopment = require("../models/CareerDevelopment.model");
const Coaching = require("../models/Coaching.model");
const LeadershipDevelopment = require("../models/LeadershipDevelopment.model");
const RecurrentTraining = require("../models/RecurrentTraining.model");
const SuccessionPlanning = require("../models/SuccessionPlanning.model");

/**
 * @desc Get logged-in employee's pending trainings summary
 * @route GET /api/talents/my-summary
 * @access Private
 */
exports.getMyTalentSummary = async (req, res) => {
  try {
    // 1️⃣ Find employee linked to logged-in user
    const employee = await Employee.findOne({ userAccount: req.user.id })
      .populate("userAccount", "firstname lastname userid");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Profile not linked" });
    }

    const employeeId = employee._id;

    // 2️⃣ Fetch only pending trainings and sort by tentative date
    const [career, coaching, leadership, recurrent, succession] = await Promise.all([
      CareerDevelopment.find({ employee: employeeId, remark: "pending" }).sort({ tentativeScheduleMonth: 1 }),
      Coaching.find({ employee: employeeId, remark: "pending" }).sort({ coachingScheduleStartMonth: 1 }),
      LeadershipDevelopment.find({ employee: employeeId, remark: "pending" }).sort({ preferredSchedule: 1 }),
      RecurrentTraining.find({ employee: employeeId, remark: "pending" }).sort({ tentativeScheduleDate: 1 }),
      SuccessionPlanning.find({ employee: employeeId, remark: "pending" }),
    ]);

    // 3️⃣ Calculate total pending trainings
    const totalPending = career.length + coaching.length + leadership.length + recurrent.length + succession.length;

    // 4️⃣ Return clean object for frontend
    res.json({
      success: true,
      totalPending,
      data: {
        career,
        coaching,
        leadership,
        recurrentTraining: recurrent,
        succession,
      },
      profile: {
        name: `${employee.userAccount.firstname} ${employee.userAccount.lastname}`,
        id: employee.userAccount.userid,
        dept: employee.department,
        pos: employee.currentPosition,
      },
    });
  } catch (error) {
    console.error("Error in getMyTalentSummary:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};