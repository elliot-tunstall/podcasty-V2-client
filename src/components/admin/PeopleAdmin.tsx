"use client"

import type React from "react"
import type { Person } from "@/types/podcast"

import { useState, useRef, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Plus, Pencil, Trash2, Upload } from "lucide-react"
import { toast } from 'sonner'
import { API } from "@/services/api"
import { generateObjectId } from "@/utils/generate"

function PeopleAdmin() {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPerson, setCurrentPerson] = useState<Person | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Omit<Person, "_id">>({
    name: "",
    image: null,
    imageUrl: "",
    bio: "",
    role: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch tags on component mount
  useEffect(() => {
    fetchPeople()
  }, [])

  const fetchPeople = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await API.get('/admin/person')
      setPeople(response.data)
    } catch (err) {
      setError('Failed to fetch people')
      toast.error('Failed to fetch people')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setCurrentPerson(null)
    setFormData({
      name: "",
      image: null,
      imageUrl: "",
      bio: "",
      role: "",
    })
    setImagePreview(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (person: Person) => {
    setCurrentPerson(person)
    setFormData({
      name: person.name,
      imageUrl: person.imageUrl,
      bio: person.bio,
      role: person.role,
    })
    setImagePreview(person.imageUrl)
    setIsDialogOpen(true)
  }

  const handleDelete = (person: Person) => {
    setCurrentPerson(person)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentPerson) return

    try {
      setIsDeleting(true)
      // Optimistically update UI
      setPeople(people.filter((t) => t._id !== currentPerson._id))
      
      // delete person from mongo
      let response = await API.delete(`admin/person/${currentPerson._id}`)
      const deletedDoc = response.data

      // delete image from cloud storage
      const key = `people/${deletedDoc.imageUrl.split("people/")[1]}`
      await API.delete('s3-bucket/delete-file', { params: { key: key } })
      toast.success("Person deleted", {
        description: `${currentPerson.name} has been removed.`,
      })

    } catch (err) {
      // Revert optimistic update on error
      setPeople(people)
      console.log(err)
      toast.error('Failed to delete person')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Store the actual file for upload
      setFormData((prev) => ({ ...prev, image: file }))
    }
  }

  const uploadFile = async (file: File | null, collection: string, objectId: string): Promise<{ publicUrl: string, key: string }> => {
    if (!file) return { publicUrl: '', key: '' }
    
    const form = new FormData()
    form.append('file', file)
    form.append('collection', collection)
    
    try {
      const response = await API.put(`s3-bucket/upload-file/${objectId}`, form)
      
      return {
        publicUrl: response.data.publicUrl,
        key: response.data.key
      }
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Prepare upload data
    const newId = generateObjectId();
    const objectId: string = (currentPerson) ? currentPerson._id : newId;
    const uploadData: Record<string, any> = {}
    const uploadedKeys: string[] = []

    try {
      // Handle file uploads
      if (formData.image) {
        const { publicUrl, key } = await uploadFile(formData.image, 'people', objectId)
        uploadData.imageUrl = publicUrl
        uploadedKeys.push(key)
      }

      // Prepare person data with uploaded files
      const personData = {
        ...formData,
        ...uploadData
      }

      let response
      if (currentPerson) {
        // Update existing person
        response = await API.put(`/admin/person/${objectId}`, personData)
        
        // Update UI optimistically
        setPeople(people.map((p) => 
          p._id === currentPerson._id ? { ...personData, _id: currentPerson._id } : p
        ))

        toast.success("Person updated", {
          description: `${personData.name}'s information has been updated.`,
        })
      } else {
        // Validate required files for new person
        if (!formData.image) {
          throw new Error("Profile image is required")
        }

        // Create new person
        response = await API.post(`/admin/person`, {...personData, _id: objectId})
        
        // Update UI
        setPeople([...people, response.data])
        
        toast.success("Person added", {
          description: `"${personData.name}" has been added.`,
        })
      }

    } catch (err) {
      // Clean up uploaded files on error
      for (const key of uploadedKeys) {
        try {
          await API.delete('s3-bucket/delete-file', { params: { key } })
        } catch (deleteErr) {
          console.error('Failed to delete file:', deleteErr)
        }
      }

      // Show error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to save person'
      toast.error(errorMessage)
      
      // Revert optimistic update if needed
      if (currentPerson) {
        setPeople(people)
      }
    } finally {
      setIsSubmitting(false)
      setIsDialogOpen(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading people...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchPeople}>Retry</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">People Management</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Person
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((person) => (
              <TableRow key={person._id}>
                <TableCell>
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img
                      src={person.imageUrl || "/placeholder.svg"}
                      alt={person.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.role}</TableCell>
                <TableCell className="max-w-xs truncate">{person.bio}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(person)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(person)}>
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

      {/* Add/Edit Person Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{currentPerson ? "Edit Person" : "Add New Person"}</DialogTitle>
            <DialogDescription>
              {currentPerson ? "Update the person's information below." : "Fill in the details to add a new person."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} encType="multipart/form-data" >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="h-16 w-16 rounded-full overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="host">Host</option>
                  <option value="guest">Guest</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
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
                    {currentPerson ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  currentPerson ? "Update" : "Add"
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
              Are you sure you want to delete {currentPerson?.name}? This action cannot be undone.
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

export default PeopleAdmin
