export const MODULE_LIST = [
  { key: "career", label: "Career Development" },
  { key: "coaching", label: "Executive Coaching" },
  { key: "leadership", label: "Leadership Development" },
  { key: "recurrent-training", label: "Recurrent Training" },
  { key: "succession", label: "Succession Planning" }
];

export const TABLE_CONFIGS = {
  career: {
    headers: ["STAFF ID", "EMPLOYEE", "DEVELOPMENT TOPIC", "SCHEDULE"],
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "N/A",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`.trim() || "Unassigned",
      col3: item.topic || "N/A",
      col4: item.tentativeScheduleMonth || "Not Set",
      status: item.remark?.toLowerCase()
    })
  },
  succession: {
    headers: ["STAFF ID", "EMPLOYEE", "GROOMED FOR", "ASSIGNMENT DETAIL"],
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "N/A",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`.trim() || "Unassigned",
      col3: item.groomedForPosition || "N/A",
      col4: item.actingAssignment?.detail || item.projectAssignments?.detail || "Standard",
      status: item.remark?.toLowerCase()
    })
  },
  coaching: {
    headers: ["STAFF ID", "EMPLOYEE", "COACH", "FOCUS AREA"],
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "N/A",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`.trim() || "Unassigned",
      col3: item.coachName || "N/A",
      col4: item.focusArea || "N/A",
      status: item.remark?.toLowerCase()
    })
  },
  leadership: {
    headers: ["STAFF ID", "EMPLOYEE", "PROGRAM", "TIMELINE"],
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "N/A",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`.trim() || "Unassigned",
      col3: item.programName || "N/A",
      col4: item.timeline || "N/A",
      status: item.remark?.toLowerCase()
    })
  },
  "recurrent-training": {
    headers: ["STAFF ID", "EMPLOYEE", "COURSE", "EXPIRY DATE"],
    getData: (item) => ({
      col1: item.employee?.userAccount?.userid || "N/A",
      col2: `${item.employee?.userAccount?.firstname || ""} ${item.employee?.userAccount?.lastname || ""}`.trim() || "Unassigned",
      col3: item.courseName || "N/A",
      col4: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
      status: item.remark?.toLowerCase()
    })
  }
};