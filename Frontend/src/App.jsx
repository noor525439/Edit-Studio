import { createBrowserRouter, RouterProvider, Navigate, useParams } from "react-router-dom"
import Home from './pages/Home'
import AuthPage from "./pages/AuthPage"
import VerifyEmail from "./pages/VerifyEmail"
import Verify from "./pages/Verify"
import Navbar from "./components/Navbar"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyOTP from "./pages/VerifyOTP"
import ChangePassword from "./pages/ChangePassword"
import Profile from "./pages/Profile"
import ClientProfile from "./pages/ClientProfile"
import EditorInfoForm from "./pages/EditorInfoForm"
import UpdateProfile from "./pages/Updateprofile"
import AboutPage from "./pages/AboutPage"
import ContactAdmin from "./pages/ContactAdmin"
import AdminMessages from "./pages/AdminMessages"
import PrivacyRiskPage from "./pages/PrivacyRiskPage"
import VettingStandardsPage from "./pages/VettingStandardsPage"
import EditorRequirementsPage from "./pages/EditorRequirementsPage"
import MasteryAcademy from "./pages/MasteryAcademy"
import VoiceGenerator from "./pages/VoiceGenerator"
import VideoToAudio from "./pages/VideoToAudio"
import SpeechToAudio from "./pages/SpeechToAudio"
import Checkout from "./pages/Checkout"
import ClientTaskDetailPage from "./pages/client/ClientTaskDetailPage"
import ClientPaymentReview from "./pages/client/ClientPaymentReview"
import EditorTaskItemDetail from "./pages/editor/EditorTaskItemDetail"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentCancel from "./pages/PaymentCancel"

import ClientDashboard from "./pages/client/ClientDashboard"
import ClientProjects from "./pages/client/ClientProjects"
import ClientProjectCreate from "./pages/client/ClientProjectCreate"
import ClientProjectDetail from "./pages/client/ClientProjectDetail"
import ClientHire from "./pages/client/ClientHire"
import EditorDashboardPage from "./pages/editor/EditorDashboardPage"
import EditorTasks from "./pages/editor/EditorTasks"
import EditorTaskDetail from "./pages/editor/EditorTaskDetail"
import EditorSubmissions from "./pages/editor/EditorSubmissions"
import EditorClientProfile from "./pages/editor/EditorClientProfile"
import EditorPublicProfile from "./pages/editor/EditorPublicProfile"
import EditorGigs from "./pages/editor/EditorGigs"
import AdminProjects from "./pages/admin/AdminProjects"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProjectDetail from "./pages/admin/AdminProjectDetail"
import AdminNotifications from "./pages/admin/AdminNotifications"
import AdminActivities from "./pages/admin/AdminActivities"
import ClientNotifications from "./pages/client/ClientNotifications"
import { dashboardPath } from "./lib/roles"
import { getData } from "./context/userContext"

const withNav = (el) => <><Navbar />{el}</>

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/signup', element: <AuthPage /> },
  { path: '/login', element: <AuthPage /> },
  { path: '/verify', element: <VerifyEmail /> },
  { path: '/verify/:token', element: <Verify /> },
  { path: '/verify-otp/:email', element: <VerifyOTP /> },
  { path: '/change-password/:email', element: <ChangePassword /> },
  { path: '/forgot-password', element: <ForgotPassword /> },

  // Client role routes
  { path: '/client/dashboard', element: withNav(<ClientDashboard />) },
  { path: '/client/projects', element: withNav(<ClientProjects />) },
  { path: '/client/projects/create', element: withNav(<ClientProjectCreate />) },
  { path: '/client/projects/:id', element: withNav(<ClientProjectDetail />) },
  { path: '/client/projects/:projectId/tasks/:taskId', element: withNav(<ClientTaskDetailPage />) },
  { path: '/client/projects/:projectId/payment', element: withNav(<ClientPaymentReview />) },
  { path: '/client/hire/:editorId', element: withNav(<ClientHire />) },
  { path: '/client/editors', element: withNav(<ClientProfile />) },

  // Editor role routes
  { path: '/editor/dashboard', element: withNav(<EditorDashboardPage />) },
  { path: '/editor/tasks', element: withNav(<EditorTasks />) },
  { path: '/editor/tasks/:id', element: withNav(<EditorTaskDetail />) },
  { path: '/editor/projects/:projectId/tasks/:taskId', element: withNav(<EditorTaskItemDetail />) },
  { path: '/editor/submissions', element: withNav(<EditorSubmissions />) },
  { path: '/editor/client-profile/:clientId', element: withNav(<EditorClientProfile />) },
  { path: '/editor/profile/:editorId', element: withNav(<EditorPublicProfile />) },
  { path: '/editor/gigs', element: withNav(<EditorGigs />) },
  { path: '/editor-info', element: withNav(<EditorInfoForm />) },

  // Admin role routes
   { path: '/admin/dashboard', element: withNav(<AdminDashboard />)},
  { path: '/admin/projects', element: withNav(<AdminProjects />) },
  { path: '/admin/projects/:id', element: withNav(<AdminProjectDetail />) },
  { path: '/admin/activities', element: withNav(<AdminActivities />) },
  { path: '/client/notifications', element: withNav(<ClientNotifications />) },
  { path: '/admin/notifications', element: withNav(<AdminNotifications />) },
  { path: '/admin/messages', element: withNav(<AdminMessages />) },

  // Fallbacks for unknown routes
  { path: '*', element: <Navigate to="/" replace /> },
  { path: '/admin/orders/:projectId/payment', element: withNav(<ClientPaymentReview />) },

  // Legacy redirects (role-prefixed URLs)
  { path: '/freelancer-dashboard', element: <Navigate to="/client/dashboard" replace /> },
  { path: '/client-dashboard', element: <Navigate to="/client/dashboard" replace /> },
  { path: '/editor-dashboard', element: <Navigate to="/editor/dashboard" replace /> },
  { path: '/admin-dashboard', element: <Navigate to="/admin/dashboard" replace /> },
  { path: '/editorprofile', element: <Navigate to="/client/editors" replace /> },
  { path: '/editor/:id', element: <LegacyEditorRedirect /> },

  { path: '/profile', element: withNav(<Profile />) },
  { path: '/update-profile', element: withNav(<UpdateProfile />) },
  { path: '/aboutus', element: <AboutPage /> },
  { path: '/contact-admin', element: <ContactAdmin /> },
  { path: '/risk-privacy', element: <PrivacyRiskPage /> },
  { path: '/vetting-standards', element: <VettingStandardsPage /> },
  { path: '/vetting-editor-standards', element: <EditorRequirementsPage /> },
  { path: '/top-tutors-channel', element: <MasteryAcademy /> },
  { path: '/voice-generator', element: <VoiceGenerator /> },
  { path: '/vedio-to-audio', element: <VideoToAudio /> },
  { path: '/speech-to-audio', element: <SpeechToAudio /> },
  { path: '/project-workspace', element: <WorkspaceRedirect /> },
  { path: '/checkout', element: withNav(<Checkout />) },
  { path: '/payment-success', element: <PaymentSuccess /> },
  { path: '/payment-cancel', element: <PaymentCancel /> },

  { path: '/:role-dashboard', element: <RoleDashboardRedirect /> },
])

function WorkspaceRedirect() {
  const { user } = getData()
  return <Navigate to={user ? dashboardPath(user.role) : "/login"} replace />
}

function RoleDashboardRedirect() {
  const role = window.location.pathname.split('/')[1]?.replace('-dashboard', '')
  return <Navigate to={dashboardPath(role)} replace />
}

function LegacyEditorRedirect() {
  const { id } = useParams()
  return <Navigate to={`/editor/profile/${id}`} replace />
}

const App = () => (
  <div className="min-h-screen bg-background">
    <RouterProvider router={router} />
  </div>
)

export default App
