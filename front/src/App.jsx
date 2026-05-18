import React from "react"; 
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ========= Public ========= */
import HomePage from "./pages/HomePage";
import Login from "./account/Login";
import Register from "./account/Register";
import About from "./pages/About";
import Sla from "./pages/Sla";
import Contacts from "./pages/Contacts";

/* ========= User ========= */
import Dashboard from "./pages/Dashboard";
import OccurrenceForm from "./pages/OccurrenceForm";
import InvestigationFollowUpWrapper from "./pages/InvestigationFollowUpWrapper";
import OccurrenceList from "./pages/OccurrenceList";
import OccurrenceTrend from "./pages/OccurrenceTrend";
import ScheduleTrend from "./schedulePage/ScheduleTrend";
import ScheduleTable from "./schedulePage/ScheduleList";
import ForgotPassword from "./account/ForgotPassword";
import ResetPassword from "./account/ResetPassword";

/* ========= Admin ========= */
import AdminHomepage from "./AdminPage/AdminHomepage";
import AdminUsers from "./AdminPage/AdminUsers";
import AdminAudit from "./AdminPage/AdminAudit";
import AdminScheduleList from "./schedulePage/AdminSchedulelist";
import ScheduleForm from "./schedulePage/ScheduleForm";

/* ========= Talent ========= */
import TalentLayout from "./layouts/TalentLayout";
import TalentDashboard from "./talentmanagement/pages/TalentDashboard";
import EmployeeProfile from "./talentmanagement/pages/EmployeeProfile";
import EmployeeRegistration from "./talentmanagement/pages/EmployeeRegistration";
import AssignTraining from "./talentmanagement/pages/AssignTraining";
import EmployeeList from "./talentmanagement/pages/EmployeeList";
import TrainingManager from "./talentmanagement/pages/TrainingManager";
import EditEmployee from "./talentmanagement/pages/EditEmployee";
import MyTraining from "./talentmanagement/pages/MyTraining";

/* ========= KPI ========= */
import FleetAssignment from "./kpi/fleetAssignment/fleetAssignment";
import UnproductiveTimeComp from "./components/unproductiveTimeComp";
import UnproductiveTimeDashboard from "./kpi/unproductiveTime/UnproductiveTimeDashboard";
import UnproductiveTimeTimer from "./kpi/unproductiveTime/UnproductiveTimeTimer";
import UnproductiveTimeList from "./kpi/unproductiveTime/UnproductiveTimeList";
import UnproductiveTimeDetails from "./kpi/unproductiveTime/UnproductiveTimeDetails";
import UnproductiveTimeApproval from "./kpi/unproductiveTime/UnproductiveTimeApproval";
import CorporateCulturePage from "./kpi/CorporateCulture/CultureCompliance";

/* ========= SMS Hazard Tracking ========= */
import SmsDashboard from "./kpi/smsRelated/smsDashboard";
import HazardList from "./kpi/smsRelated/hazardList";
import HazardForm from "./kpi/smsRelated/hazardForm";
import HazardDetail from "./kpi/smsRelated/hazardDetail";
import HazardAlertBox from "./kpi/smsRelated/hazardAlertBox";

/* ========= FDM ========= */
import FdmLayout from "./layouts/FdmLayout"; 
import FdmDshboard from "./fdm/fdmDashboard";
import FdmForm from "./fdm/fdmForm";
import FdmRelatedPage from "./kpi/FdmRelated/FdmRelatedPage";

/* ========= Layouts ========= */
import HomeNav from "./components/HomeNav";
import Nav from "./components/Nav";
import AdminNav from "./components/AdminNav";
import AdminLayout from "./layouts/AdminLayout";

/* ========= Guards ========= */
import AdminRoute from "./AdminPage/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

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