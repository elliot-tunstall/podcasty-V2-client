"use client"
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "../context/AuthContext"
import PeopleAdmin from "../components/admin/PeopleAdmin.tsx"
import TagsAdmin from "../components/admin/TagsAdmin.tsx"
import EpisodesAdmin from "../components/admin/EpisodesAdmin.tsx"

function AdminPage() {
  // const { user } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  // // In a real app, you would check if the user has admin privileges
  // const isAdmin = user !== null

  // if (!isAdmin) {
  //   return (
  //     <div className="container mx-auto px-4 py-12 text-center">
  //       <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
  //       <p className="text-muted-foreground mb-6">You do not have permission to access this page.</p>
  //       <Link to="/" className="text-primary hover:underline">
  //         Return to Home
  //       </Link>
  //     </div>
  //   )
  // }

  const getActiveTab = () => {
    if (currentPath.includes("/admin/tags")) return "tags"
    if (currentPath.includes("/admin/episodes")) return "episodes"
    return "people"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs value={getActiveTab()} className="w-full mb-8">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="people" asChild>
            <Link to="/admin/people">People</Link>
          </TabsTrigger>
          <TabsTrigger value="tags" asChild>
            <Link to="/admin/tags">Tags</Link>
          </TabsTrigger>
          <TabsTrigger value="episodes" asChild>
            <Link to="/admin/episodes">Episodes</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Routes>
        <Route path="/" element={<Navigate to="/admin/people" replace />} />
        <Route path="/people" element={<PeopleAdmin />} />
        <Route path="/tags" element={<TagsAdmin />} />
        <Route path="/episodes" element={<EpisodesAdmin />} />
      </Routes>
    </div>
  )
}

export default AdminPage
