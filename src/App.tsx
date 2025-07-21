"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// import components
import { Toaster } from "@/components/ui/sonner"
import { Header } from "./components/Header"
import { AudioPlayerBar } from "./components/AudioPlayer"
import { AuthenticateRoute, AdminRoute } from './components/PrivateRoute.tsx';

// import pages
import HomePage from "./pages/HomePage"
import EpisodePage from "./pages/EpisodePage"
import AllEpisodesPage from "./pages/AllEpisodesPage"
import ProfilePage from "./pages/ProfilePage"
import AdminPage from "./pages/AdminPage"
import Unauthorized from './pages/UnauthorizedPage.tsx'
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage.tsx"

// import context
import { AuthProvider } from "./context/AuthContext"
import { PodcastProvider } from "./context/PodcastContext"
import { AudioPlayerProvider } from "./context/AudioPlayerContext.tsx"

function App() {

  return (
    <AuthProvider>
      <PodcastProvider>
        <AudioPlayerProvider>
          <Router>
            <Toaster richColors position="bottom-right" expand={true} />
            <Routes>
              {/* Login route with no header/footer */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignUpPage />} />
              
              {/* All other routes with header/footer */}
              <Route path="*" element={
                
                  <div className="min-h-screen mb-24" >
                    <Header />
                    <Routes>
                      <Route path="/" element={<HomePage onPlayEpisode={() => {}} />} />
                      <Route path="/episode/:id" element={<EpisodePage onPlayEpisode={() => {}} />} />
                      <Route path="/episodes" element={<AllEpisodesPage onPlayEpisode={() => {}} />} />
                      <Route path="/admin/*" element={
                        <AdminRoute>
                          <AdminPage />
                        </AdminRoute>} />
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/profile" element={
                        <AuthenticateRoute>
                          <ProfilePage />
                        </AuthenticateRoute>} />
                    </Routes>
                    <AudioPlayerBar/>
                  </div>
              } />
            </Routes>
          </Router>
        </AudioPlayerProvider>
      </PodcastProvider>
    </AuthProvider>
  )
}

export default App
