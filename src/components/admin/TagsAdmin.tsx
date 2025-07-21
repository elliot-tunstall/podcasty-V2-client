"use client"

import type React from "react"
import type { Tag } from "@/types/podcast"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from 'sonner'
import { API } from "@/services/api"


function TagsAdmin() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTag, setCurrentTag] = useState<Tag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Omit<Tag, "_id">>({
    name: "",
    color: "#000000",
  })

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await API.get('/admin/tag')
      setTags(response.data)
    } catch (err) {
      setError('Failed to fetch tags')
      toast.error('Failed to fetch tags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setCurrentTag(null)
    setFormData({
      name: "",
      color: "#000000",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (tag: Tag) => {
    setCurrentTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (tag: Tag) => {
    setCurrentTag(tag)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentTag) return

    try {
      setIsDeleting(true)
      // Optimistically update UI
      setTags(tags.filter((t) => t._id !== currentTag._id))
      
      // Make API call
      await API.delete(`admin/tag/${currentTag._id}`)
      
      toast.success("Tag deleted", {
        description: `"${currentTag.name}" has been removed.`,
      })
    } catch (err) {
      // Revert optimistic update on error
      setTags(tags)
      toast.error('Failed to delete tag')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (currentTag) {
        // Update existing tag
        const updatedTag = { ...formData, _id: currentTag._id }
        
        // Optimistically update UI
        setTags(tags.map((t) => (t._id === currentTag._id ? updatedTag : t)))
        
        // Make API call
        await API.put(`/admin/tag/${currentTag._id}`, formData)
        
        toast.success("Tag updated", {
          description: `"${formData.name}" has been updated.`,
        })
      } else {
        // Add new tag
        const response = await API.post('/admin/tag', formData)
        const newTag = response.data
        
        // Update UI with the new tag from the server
        setTags([...tags, newTag])
        
        toast.success("Tag added", {
          description: `"${formData.name}" has been added.`,
        })
      }
    } catch (err) {
      // Revert optimistic update on error
      if (currentTag) {
        setTags(tags)
      }
      toast.error('Failed to save tag')
    } finally {
      setIsSubmitting(false)
      setIsDialogOpen(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading tags...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchTags}>Retry</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tags Management</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag._id}>
                <TableCell>
                  <div className="h-6 w-6 rounded-full" style={{ backgroundColor: tag.color }} />
                </TableCell>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(tag)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(tag)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Tag Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
            <DialogDescription>
              {currentTag ? "Update the tag information below." : "Fill in the details to add a new tag."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full border" style={{ backgroundColor: formData.color }} />
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {currentTag ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  currentTag ? "Update" : "Add"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag "{currentTag?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TagsAdmin
