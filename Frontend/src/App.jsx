import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from './pages/Home'
// Login Imports
import AuthPage from "./pages/AuthPage"
import VerifyEmail from "./pages/VerifyEmail"
import Verify from "./pages/Verify"
import Navbar from "./components/Navbar"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyOTP from "./pages/VerifyOTP"
import ChangePassword from "./pages/ChangePassword"

// Dashboard Imports
import AdminDashboard from "./pages/AdminDashboard"
import EditorDashboard from "./pages/EditorDashboard"
import ClientDashboard from "./pages/ClientDashboard"
import Profile from "./pages/Profile"
import ClientProfile from "./pages/ClientProfile"
import EditorDetails from "./pages/EditorDetails"
import EditorInfoForm from "./pages/EditorInfoForm"
import UpdateProfile from "./pages/Updateprofile"
import AboutPage from "./pages/AboutPage"
import ContactAdmin from "./pages/ContactAdmin"
import PrivacyRiskPage from "./pages/PrivacyRiskPage"
import VettingStandardsPage from "./pages/VettingStandardsPage"
import EditorRequirementsPage from "./pages/EditorRequirementsPage"
import MasteryAcademy from "./pages/MasteryAcademy"
import VoiceGenerator from "./pages/VoiceGenerator"
import VideoToAudio from "./pages/VideoToAudio"
import SpeechToAudio from "./pages/SpeechToAudio"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/signup',
    element: <AuthPage />
  },
  {
    path: '/login',
    element: <AuthPage />
  },
  {
    path: '/verify',
    element: <VerifyEmail />
  },
  {
    path: '/verify/:token',
    element: <Verify />
  },
  {
    path: '/verify-otp/:email',
    element: <VerifyOTP />
  },
  {
    path: '/change-password/:email',
    element: <ChangePassword />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },

  {
    path: '/admin-dashboard',
    element: <><Navbar /><AdminDashboard /></>
  },
  {
    path: '/profile',
    element: <><Navbar /><Profile /></>
  },
  {
    path: '/editor-dashboard',
    element: <><Navbar /><EditorDashboard /></>
  },
  {
    path: '/freelancer-dashboard',
    element: <><Navbar /><ClientDashboard /></>
  }, {
    path: '/editorprofile',
    element: <><Navbar /><ClientProfile /></>
  }, {
    path: '/editor/:id',
    element: <><EditorDetails /></>
  }
  , {
    path: '/editor-info',
    element: <><Navbar /><EditorInfoForm /></>
  }
  , {
    path: '/update-profile',
    element: <><Navbar /><UpdateProfile /></>
  },
  {
    path: '/aboutus',
    element: <AboutPage />
  }, {
    path: '/contact-admin',
    element: <><ContactAdmin /></>
  }, {
    path: '/risk-privacy',
    element: <><PrivacyRiskPage /></>
  }
  , {
    path: '/vetting-standards',
    element: <><VettingStandardsPage /></>
  }
  , {
    path: '/vetting-editor-standards',
    element: <><EditorRequirementsPage /></>
  }
  , {
    path: '/top-tutors-channel',
    element: <><MasteryAcademy /></>
  }
  , {
    path: '/voice-generator',
    element: <><VoiceGenerator /></>
  }
  , {
    path: '/vedio-to-audio',
    element: <><VideoToAudio /></>
  }
  , {
    path: '/speech-to-audio',
    element: <><SpeechToAudio /></>
  }
])

const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <RouterProvider router={router} />
    </div>
  )
}

export default App