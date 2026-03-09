import React from "react"; // Added React import for safety
import { Routes, Route } from "react-router-dom";

/* ========= Public / User Pages ========= */
import HomePage from "./pages/HomePage";
import Login from "./account/Login";
import Register from "./account/Register";
import Dashboard from "./pages/Dashboard";
import OccurrenceForm from "./pages/OccurrenceForm";
import InvestigationFollowUpWrapper from "./pages/InvestigationFollowUpWrapper";
import OccurrenceList from "./pages/OccurrenceList";
import OccurrenceTrend from "./pages/OccurrenceTrend";
import ForgotPassword from "./account/ForgotPassword";
import ResetPassword from "./account/ResetPassword";
import ScheduleTrend from "./schedulePage/ScheduleTrend";
import ScheduleTable from "./schedulePage/ScheduleList";
import About from "./pages/About";
import Sla from "./pages/Sla";
import Contacts from "./pages/Contacts";

/* ========= Admin Pages ========= */
import AdminHomepage from "./AdminPage/AdminHomepage";
import AdminUsers from "./AdminPage/AdminUsers";
import AdminAudit from "./AdminPage/AdminAudit";
import AdminScheduleList from "./schedulePage/AdminSchedulelist";
import ScheduleForm from "./schedulePage/ScheduleForm";

/* ========= Talent Management Layout & Pages ========= */
import TalentLayout from "./layouts/TalentLayout";
import TalentDashboard from "./talentmanagement/pages/TalentDashboard";
import EmployeeProfile from "./talentmanagement/pages/EmployeeProfile";
import EmployeeRegistration from "./talentmanagement/pages/EmployeeRegistration";
import AssignTraining from "./talentmanagement/pages/AssignTraining";
import EmployeeList from "./talentmanagement/pages/EmployeeList";
import TrainingManager from "./talentmanagement/pages/TrainingManager";
import EditEmployee from "./talentmanagement/pages/EditEmployee";
import MyTraining from "./talentmanagement/pages/MyTraining"; // ✅ Imported

/* ========= Talent Management Tabs ========= */
import CareerDevelopmentTab from "./talentmanagement/tabs/CareerDevelopmentTab";
import RecurrentTrainingTab from "./talentmanagement/tabs/RecurrentTrainingTab";
import LeadershipDevelopmentTab from "./talentmanagement/tabs/LeadershipDevelopmentTab";
import CoachingTab from "./talentmanagement/tabs/CoachingTab";
import SuccessionPlanningTab from "./talentmanagement/tabs/SuccessionPlanningTab";

/* ========= FDM Module Pages ========= */
import FdmLayout from "./layouts/FdmLayout"; 
import FdmDshboard from "./fdm/fdmDashboard";
import FdmForm from "./fdm/fdmForm";

/* ========= Layouts & Navs ========= */
import HomeNav from "./components/HomeNav";
import Nav from "./components/Nav";
import AdminLayout from "./layouts/AdminLayout";

/* ========= Route Protection ========= */
import AdminRoute from "./AdminPage/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* ===== Landing & Public Pages ===== */}
      <Route path="/" element={<><HomeNav /><HomePage /></>} />
      <Route path="/about" element={<><HomeNav /><About /></>} />
      <Route path="/sla" element={<><HomeNav /><Sla /></>} />
      <Route path="/contacts" element={<><HomeNav /><Contacts /></>} />

      {/* ===== Auth Pages ===== */}
      <Route path="/login" element={<><HomeNav /><Login /></>} />
      <Route path="/register" element={<><HomeNav /><Register /></>} />
      <Route path="/forgot-password" element={<><HomeNav /><ForgotPassword /></>} />
      <Route path="/reset-password" element={<><HomeNav /><ResetPassword /></>} />

      {/* ===== Core User Pages ===== */}
      <Route path="/dashboard" element={<ProtectedRoute><Nav /><Dashboard /></ProtectedRoute>} />
      <Route path="/form" element={<ProtectedRoute><Nav /><OccurrenceForm /></ProtectedRoute>} />
      <Route path="/list" element={<ProtectedRoute><Nav /><OccurrenceList /></ProtectedRoute>} />
      <Route path="/trends" element={<ProtectedRoute><Nav /><OccurrenceTrend /></ProtectedRoute>} />
      <Route path="/investigationfollowup" element={<ProtectedRoute><Nav /><InvestigationFollowUpWrapper /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><Nav /><ScheduleTable /></ProtectedRoute>} />
      
      {/* ✅ Corrected path to match Nav.js link */}
      <Route path="/talent/my-training" element={<ProtectedRoute><Nav /><MyTraining /></ProtectedRoute>} />

      {/* ===== ADMIN SECTION ===== */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminHomepage />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="schedulelist" element={<AdminScheduleList />} />
        <Route path="schedules/create" element={<ScheduleForm />} />
        <Route path="scheduletrend" element={<ScheduleTrend />} />
      </Route>

      {/* ===== FDM MODULE ===== */}
      <Route path="/fdm" element={<ProtectedRoute allowedRoles={["superadmin", "manager", "fdm_officer"]}><FdmLayout /></ProtectedRoute>}>
        <Route index element={<FdmDshboard />} />
        <Route path="fdmform" element={<FdmForm />} />
      </Route>

      {/* ===== TALENT MANAGEMENT ===== */}
      <Route path="/talent" element={<ProtectedRoute allowedRoles={["superadmin", "manager", "team_leader"]}><TalentLayout /></ProtectedRoute>}>
        <Route index element={<TalentDashboard />} />
        <Route path="dashboard" element={<TalentDashboard />} />
        <Route path="register" element={<EmployeeRegistration />} />
        <Route path="assign" element={<AssignTraining />} />
        <Route path="trainingmanager" element={<TrainingManager />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="list" element={<EmployeeList />} />
        <Route path="edit/:id" element={<EditEmployee />} />
      </Route>
    </Routes>
  );
}