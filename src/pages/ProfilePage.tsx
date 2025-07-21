"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "../context/AuthContext"

function ProfilePage() {
  const { user, setUser } = useAuth()
  
  // Mock logout function
  const logout = () => {
    setUser(null)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">You are not signed in</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile</p>
          <Button>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
                  <p>{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/10 text-primary rounded-md p-4 mb-4">
                <p className="font-medium">You are currently on the Free plan</p>
              </div>
              <Button>Upgrade to Premium</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
