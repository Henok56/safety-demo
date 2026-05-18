import React from "react"; 
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ========= Public ========= */
import HomePage from "./pages/HomePage.jsx";
import Login from "./account/Login.jsx";
import Register from "./account/Register.jsx";
import About from "./pages/About.jsx";
import Sla from "./pages/Sla.jsx";
import Contacts from "./pages/Contacts.jsx";

/* ========= User ========= */
import Dashboard from "./pages/Dashboard.jsx";
import OccurrenceForm from "./pages/OccurrenceForm.jsx";
import InvestigationFollowUpWrapper from "./pages/InvestigationFollowUpWrapper.jsx";
import OccurrenceList from "./pages/OccurrenceList.jsx";
import OccurrenceTrend from "./pages/OccurrenceTrend.jsx";
import ScheduleTrend from "./schedulePage/ScheduleTrend.jsx";
import ScheduleTable from "./schedulePage/ScheduleList.jsx";
import ForgotPassword from "./account/ForgotPassword.jsx";
import ResetPassword from "./account/ResetPassword.jsx";

/* ========= Admin ========= */
import AdminHomepage from "./AdminPage/AdminHomepage.jsx";
import AdminUsers from "./AdminPage/AdminUsers.jsx";
import AdminAudit from "./AdminPage/AdminAudit.jsx";
import AdminScheduleList from "./schedulePage/AdminSchedulelist.jsx";
import ScheduleForm from "./schedulePage/ScheduleForm.jsx";

/* ========= Talent ========= */
import TalentLayout from "./layouts/TalentLayout.jsx";
import TalentDashboard from "./talentmanagement/pages/TalentDashboard.jsx";
import EmployeeProfile from "./talentmanagement/pages/EmployeeProfile.jsx";
import EmployeeRegistration from "./talentmanagement/pages/EmployeeRegistration.jsx";
import AssignTraining from "./talentmanagement/pages/AssignTraining.jsx";
import EmployeeList from "./talentmanagement/pages/EmployeeList.jsx";
import TrainingManager from "./talentmanagement/pages/TrainingManager.jsx";
import EditEmployee from "./talentmanagement/pages/EditEmployee.jsx";
import MyTraining from "./talentmanagement/pages/MyTraining.jsx";

/* ========= KPI ========= */
import FleetAssignment from "./kpi/fleetAssignment/fleetAssignment.jsx";
import UnproductiveTimeComp from "./components/unproductiveTimeComp.jsx";
import UnproductiveTimeDashboard from "./kpi/unproductiveTime/UnproductiveTimeDashboard.jsx";
import UnproductiveTimeTimer from "./kpi/unproductiveTime/UnproductiveTimeTimer.jsx";
import UnproductiveTimeList from "./kpi/unproductiveTime/UnproductiveTimeList.jsx";
import UnproductiveTimeDetails from "./kpi/unproductiveTime/UnproductiveTimeDetails.jsx";
import UnproductiveTimeApproval from "./kpi/unproductiveTime/UnproductiveTimeApproval.jsx";
import CorporateCulturePage from "./kpi/CorporateCulture/CultureCompliance.jsx";

/* ========= SMS Hazard Tracking ========= */
import SmsDashboard from "./kpi/smsRelated/smsDashboard.jsx";
import HazardList from "./kpi/smsRelated/hazardList.jsx";
import HazardForm from "./kpi/smsRelated/hazardForm.jsx";
import HazardDetail from "./kpi/smsRelated/hazardDetail.jsx";
import HazardAlertBox from "./kpi/smsRelated/hazardAlertBox.jsx";

/* ========= FDM ========= */
import FdmLayout from "./layouts/FdmLayout.jsx"; 
import FdmDshboard from "./fdm/fdmDashboard.jsx";
import FdmForm from "./fdm/fdmForm.jsx";
import FdmRelatedPage from "./kpi/FdmRelated/FdmRelatedPage.jsx";

/* ========= Layouts ========= */
import HomeNav from "./components/HomeNav.jsx";
import Nav from "./components/Nav.jsx";
import AdminNav from "./components/AdminNav.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

/* ========= Guards ========= */
import AdminRoute from "./AdminPage/AdminRoute.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* ===== PUBLIC ===== */}
        <Route path="/" element={<><HomeNav /><HomePage /></>} />
        <Route path="/about" element={<><HomeNav /><About /></>} />
        <Route path="/sla" element={<><HomeNav /><Sla /></>} />
        <Route path="/contacts" element={<><HomeNav /><Contacts /></>} />

        {/* ===== AUTH ===== */}
        <Route path="/login" element={<><HomeNav /><Login /></>} />
        <Route path="/forgot-password" element={<><HomeNav /><ForgotPassword /></>} />
        <Route path="/reset-password" element={<><HomeNav /><ResetPassword /></>} />

        {/* ===== USER ===== */}
        <Route path="/dashboard" element={<ProtectedRoute><Nav /><Dashboard /></ProtectedRoute>} />
        <Route path="/form" element={<ProtectedRoute><Nav /><OccurrenceForm /></ProtectedRoute>} />
        <Route path="/list" element={<ProtectedRoute><Nav /><OccurrenceList /></ProtectedRoute>} />
        <Route path="/trends" element={<ProtectedRoute><Nav /><OccurrenceTrend /></ProtectedRoute>} />
        <Route path="/investigationfollowup" element={<ProtectedRoute><Nav /><InvestigationFollowUpWrapper /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Nav /><ScheduleTable /></ProtectedRoute>} />
        <Route path="/scheduletrend" element={<ProtectedRoute><Nav /><ScheduleTrend /></ProtectedRoute>} />
        <Route path="/talent/my-training" element={<ProtectedRoute><Nav /><MyTraining /></ProtectedRoute>} />
        
        {/* ✅ ONLY Hazard Form is handled here under the top-header user layout Nav */}
        <Route path="/sms/form" element={<ProtectedRoute><Nav /><HazardForm /></ProtectedRoute>} />

        <Route path="/admin/talentmy-training" element={<Navigate to="/talent/my-training" replace />} />

        {/* ===== ADMIN ROOT ===== */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="register-user" element={<Register />} />        

          <Route index element={<AdminHomepage />} />
          <Route path="register" element={<Navigate to="/admin/talent/register" replace />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="schedulelist" element={<AdminScheduleList />} />
          <Route path="schedules/create" element={<ScheduleForm />} />
          <Route path="fleet-assignment" element={<FleetAssignment />} />

          {/* FDM Related Monitoring Page */}
          <Route path="fdm-monitoring" element={<FdmRelatedPage />} />

          {/* ===== TALENT (INSIDE ADMIN) ===== */}
          <Route 
            path="talent"
            element={
              <ProtectedRoute allowedRoles={["superadmin", "manager", "team_leader", "user"]}>
                <TalentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TalentDashboard />} />
            <Route path="dashboard" element={<TalentDashboard />} />
            <Route
              path="register"
              element={
                <ProtectedRoute allowedRoles={["superadmin", "manager", "user"]}>
                  <EmployeeRegistration />
                </ProtectedRoute>
              }
            />
            <Route path="assign" element={<AssignTraining />} />
            <Route path="trainingmanager" element={<TrainingManager />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="list" element={<EmployeeList />} />
            <Route path="edit/:id" element={<EditEmployee />} />
          </Route>
        </Route>

        {/* Backward-compatible talent URLs */}
        <Route path="/talent" element={<Navigate to="/admin/talent" replace />} />
        <Route path="/talent/*" element={<Navigate to="/admin/talent/dashboard" replace />} />

        {/* ===== FDM ===== */}
        <Route path="/fdm" element={
          <ProtectedRoute allowedRoles={["superadmin", "manager", "fdm_officer", "user"]}>
            <FdmLayout />
          </ProtectedRoute>
        }>
          <Route index element={<FdmDshboard />} />
          <Route path="fdmform" element={<FdmForm />} />
        </Route>

        {/* ===== KPI ===== */}
        <Route
          path="/kpi"
          element={
            <ProtectedRoute allowedRoles={["superadmin", "manager", "team_leader", "user"]}>
              <div style={{ display: "flex", minHeight: "100vh" }}>
                <AdminNav />
                <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                  <Outlet />
                </div>
              </div>
            </ProtectedRoute>
          }
        >
          {/* ================= EXISTING KPI MODULES ================= */}
          <Route path="fleet-assignment" element={<FleetAssignment />} />
          <Route path="corporate-culture" element={<CorporateCulturePage />} />

          {/* ================= UNPRODUCTIVE TIME MODULE ================= */}
          <Route path="unproductive-time">
            <Route index element={<UnproductiveTimeComp />} />
            <Route path="dashboard" element={<UnproductiveTimeDashboard />} />
            <Route path="timer" element={<UnproductiveTimeTimer />} />
            <Route path="list" element={<UnproductiveTimeList />} />
            <Route path=":id" element={<UnproductiveTimeDetails />} />
            <Route path="approval" element={<UnproductiveTimeApproval />} />
          </Route>

          {/* ================= SMS HAZARD TRACKING MODULE ================= */}
          <Route path="sms">
            {/* Dashboard and Lists remain under /kpi/sms structural AdminNav layout */}
            <Route index element={<SmsDashboard />} />
            <Route path="dashboard" element={<SmsDashboard />} />
            <Route path="list" element={<HazardList />} />
            <Route path="history" element={<HazardList />} />
            <Route path="detail/:id" element={<HazardDetail />} />
            <Route path=":id" element={<HazardDetail />} />
            
            {/* Redirect back-office form path to the standalone user route path */}
            <Route path="form" element={<Navigate to="/sms/form" replace />} />
          </Route>
        </Route>

        {/* ===== SMS GLOBAL ROUTE REDIRECTS ===== */}
        <Route path="/sms" element={<Navigate to="/kpi/sms/dashboard" replace />} />
        <Route path="/sms/dashboard" element={<Navigate to="/kpi/sms/dashboard" replace />} />
        <Route path="/sms/list" element={<Navigate to="/kpi/sms/list" replace />} />
        <Route path="/sms/history" element={<Navigate to="/kpi/sms/list" replace />} />

        {/* ===== 404 Fallback ===== */}
        <Route path="*" element={<div style={{ textAlign: 'center', padding: '50px' }}><h2>Page Not Found</h2><p>The page you're looking for doesn't exist.</p></div>} />
      </Routes>
    </>
  );
}