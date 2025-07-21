"use client"

import { Link, useNavigate } from "react-router-dom"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Headphones } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "./Header.css"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, setUser} = useAuth()
  const navigate = useNavigate()

  // Mock logout function
  const handleLogout = async () => {
    await authService.logout();
  }

  const handleProfileClick = () => {
    navigate("/profile")
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="backdrop"></div>
      <div className="backdrop-edge"></div>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2">
          <Headphones className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">PodcastHub</span>
        </Link>

        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {user.firstName.charAt(0)}
                  </div>
                  <span>Hey, {user.firstName} {user.lastName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
                <DropdownMenuItem>Favorites</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
