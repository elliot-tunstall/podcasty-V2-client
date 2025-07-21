"use client"

import type React from "react"
import type { Tag, Person, Episode, Podcast } from "@/types/podcast"
import type { Transcription } from "@/types/transcription"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Plus, Pencil, Trash2, Upload, Play } from "lucide-react"
import { toast } from 'sonner'
import { API } from "@/services/api"
// import { formatTranscript } from "@/services/backBlaze"
import { formatDuration } from "@/utils/format"
import { TranscriptEditor } from "./TranscriptEditor"
// import TranscriptEditor from "../TranscriptEditor"

function EpisodesAdmin() {
  const [people, setPeople] = useState<Person[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Omit<Episode, "_id" | "image" | "audio">>({
    podcastId: "",
    title: "",
    number: 1,
    publishedAt: new Date().toISOString().split("T")[0],
    coverImageUrl: "",
    duration: 0,
    tags: [] as string[],
    host: "",
    guests: [] as string[],
    audioUrl: "",
    description: "",
    transcription: {
      text: "",
      words: [],
      segments: []
    },
    requiredTier: 0,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

// Fetch tags on component mount
useEffect(() => {
  try { 
    setIsLoading(true)
    setError(null)
    fetchPeople()
    fetchTags()
    fetchEpisodes()
    fetchPodcasts()
  } catch {
    setError('Failed to fetch episodes')
    toast.error('Failed to fetch episodes')
  } finally {
    setIsLoading(false)
  }
}, [isSubmitting])

  const fetchPeople = async () => {
      const response = await API.get('/admin/person')
      setPeople(response.data)
  }

  const fetchTags = async () => {
      const response = await API.get('/admin/tag')
      setTags(response.data)
  }

  const fetchEpisodes = async () => {
    const response = await API.get('admin/episode')
    setEpisodes(response.data)
  }

  const fetchPodcasts = async () => {
    const response = await API.get('admin/podcast')
    setPodcasts(response.data)
  }

  const handleAddNew = () => {
    setCurrentEpisode(null)
    setFormData({
      podcastId: "",
      title: "",
      number: episodes.length > 0 ? Math.max(...episodes.map((e) => e.number)) + 1 : 1,
      publishedAt: new Date().toISOString().split("T")[0],
      coverImageUrl: "",
      duration: 0,
      tags: [],
      host: "",
      guests: [],
      audioUrl: "",
      description: "",
      transcription: {
        text: "",
        words: [],
        segments: []
      },
      requiredTier: 0,
    })
    setImagePreview(null)
    setAudioPreview(null)
    setImageFile(null)
    setAudioFile(null)
    setIsDialogOpen(true)
  }

  const handleEdit = async (episode: Episode) => {
    setCurrentEpisode(episode)
    setFormData({
      podcastId: episode.podcastId,
      title: episode.title,
      number: episode.number,
      publishedAt: episode.publishedAt,
      coverImageUrl: episode.coverImageUrl,
      duration: episode.duration,
      tags: episode.tags,
      host: episode.host,
      guests: episode.guests,
      audioUrl: episode.audioUrl,
      description: episode.description,
      transcription: episode.transcription,
      requiredTier: episode.requiredTier,
    })
    setImagePreview(episode.coverImageUrl)
    setAudioPreview(episode.audioUrl)
    setImageFile(null)
    setAudioFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (episode: Episode) => {
    setCurrentEpisode(episode)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentEpisode) return

    try {
      setIsDeleting(true)
      // Optimistically update UI
      setPeople(people.filter((t) => t._id !== currentEpisode._id))
      
      // delete person from mongo
      let response = await API.delete(`admin/episode/${currentEpisode._id}`)
      const deletedDoc: Episode = response.data

      // delete files from cloud storage
      await API.delete('s3-bucket/delete-file', { params: { key: url2Key(deletedDoc.coverImageUrl, "episode") } })
      await API.delete('s3-bucket/delete-file', { params: { key: deletedDoc.audioKey} })
    

      toast.success("Episode deleted", {
        description: `${currentEpisode.title} has been deleted.`,
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setFormData((prev) => ({ ...prev, number: isNaN(value) ? 0 : value }))
  }

  // const handleTierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = Number.parseInt(e.target.value)
  //   setFormData((prev) => ({ ...prev, requiredTier: isNaN(value) ? 0 : Math.min(2, Math.max(0, value)) }))
  // }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setImageFile(file)
      // Store the actual file for upload
    }
  }

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        setAudioPreview(reader.result as string)
      }
      reader.readAsDataURL(file);
      setAudioFile(file)
      toast("Processing audio", {
        description: "Generating transcript. This may take a moment...",
      })
      setIsTranscribing(true)
      const form = new FormData();
      form.append('file', file);
      await API.post('api/transcription', form)
      .then((res) => {
        setFormData((prev) => ({ ...prev, transcription: res.data, duration: res.data.duration  }))
        toast.success("Transcript generated", {
          description: "The audio has been processed successfully.",
        })
      })
      .catch(() => {
        toast.error("Failed to process audio", {
          description: "Transcription generation failed",
        })
      })
      .finally(() => {
        setIsTranscribing(false)
      })
    }
  }

  const handleTagsChange = (tagId: string) => {
    setFormData((prev) => {
      const isSelected = prev.tags.includes(tagId)
      
      if (isSelected) {
        // Remove tag
        return {
          ...prev,
          tags: prev.tags.filter((id) => id !== tagId)
        }
      } else {
        // Add tag
        return {
          ...prev,
          tags: [...prev.tags, tagId]
        }
      }
    })
  }

  const handleGuestsChange = (personId: string) => {
    setFormData((prev) => {
      const isSelected = prev.guests.includes(personId)
      
      if (isSelected) {
        // Remove guest
        return {
          ...prev,
          guests: prev.guests.filter((id) => id !== personId)
        }
      } else {
        // Add guest
        return {
          ...prev,
          guests: [...prev.guests, personId]
        }
      }
    })
  }

  const handleHostChange = (hostId: string) => {
    const host = people.find((p) => p._id === hostId)
    if (host) {
      setFormData((prev) => ({
        ...prev,
        host: hostId,
      }))
    }
  }

  const handlePodcastChange = (podcastId: string) => {
    const podcast = podcasts.find((p) => p._id === podcastId)
    if (podcast) {
      setFormData((prev) => ({
        ...prev,
        podcastId: podcastId,
      }))
    }
  }

  const updateTranscription = (transcription: Transcription) => {
    setFormData((prev) => ({
      ...prev,
      transcription: transcription
    }))
  }

  const uploadFile = async (file: File | null, collection: string, objectId: string): Promise<{ publicUrl: string, key: string }> => {
    if (!file) return { publicUrl: '', key: '' }
    
    const form = new FormData()
    form.append('file', file)
    form.append('collection', collection)
    
    try {
      const promise = API.put(`s3-bucket/upload-file/${objectId}`, form)
      toast.promise(promise, {
        loading: `Loading ${collection} file...`,
        success: (res) => {
          return res.data.message;
        },
        error: 'Error uploading file',
      })
      const response = await promise
      
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
    // Check if any tags are selected
    if (formData.tags.length === 0) {
      toast.error("Please select at least one tag")
      return
    }
    // Check if any guests are selected
    if (formData.guests.length === 0) {
      toast.error("Please select at least one guest")
      return
    }
    setIsSubmitting(true)
    // Prepare upload data
    const newId = generateObjectId();
    const objectId: string = (currentEpisode) ? currentEpisode._id : newId;
    const uploadData: Record<string, any> = {}
    const uploadedKeys: string[] = []
    try {
      // Handle file uploads
      if (imageFile) {
        const { publicUrl, key } = await uploadFile(imageFile, 'episodes', objectId)
        uploadData.coverImageUrl = publicUrl
        uploadedKeys.push(key)
      }
      if (audioFile) {
        const { key, publicUrl } = await uploadFile(audioFile, 'episodes', objectId)
        uploadData.audioKey = key
        uploadData.audioUrl = publicUrl
        uploadedKeys.push(key)
      }
      // Prepare episode data (do NOT include imageFile/audioFile)
      const episodeData = {
        ...formData,
        ...uploadData
      }
      let response
      if (currentEpisode) {
        console.log(episodeData)
        response = await API.put(`/admin/episode/${objectId}`, episodeData)
        // Update UI optimistically
        setEpisodes(episodes.map((e) => 
          e._id === currentEpisode._id ? { ...episodeData, _id: currentEpisode._id } : e
        ))
        toast.success("Episode updated", {
          description: `Episode ${episodeData.number} has been updated.`,
        })
      } else {
        // Validate required files for new episodes
        if (!imageFile || !audioFile || !formData.transcription) {
          throw new Error("Required files not uploaded")
        }
        response = await API.post(`/admin/episode`, {...episodeData, _id: objectId})
        // Update UI
        setEpisodes([...episodes, response.data])
        toast.success("Episode added", {
          description: `"${episodeData.title}" has been added.`,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to save episode'
      toast.error(errorMessage)
      // Revert optimistic update if needed
      if (currentEpisode) {
        setEpisodes(episodes)
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
        <h2 className="text-2xl font-bold">Episodes Management</h2>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Episode
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Episode #</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {episodes.map((episode) => (
              <TableRow key={episode._id}>
                <TableCell>
                  <div className="h-12 w-12 rounded overflow-hidden">
                    <img
                      src={episode.coverImageUrl || "/placeholder.svg"}
                      alt={episode.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{episode.title}</TableCell>
                <TableCell>{episode.number}</TableCell>
                <TableCell>{formatDuration(episode.duration)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {episode.tags.map((tag, index) => {
                      const tagData = tags.find((t) => t._id === tag)
                      return (
                        <div
                          key={index}
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: tagData?.color || "#888" }}
                        >
                          {tagData?.name}
                        </div>
                      )
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {episode.requiredTier === 0 ? "Free" : episode.requiredTier === 1 ? "Basic" : "Premium"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(episode)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(episode)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Episode Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentEpisode ? "Edit Episode" : "Add New Episode"}</DialogTitle>
            <DialogDescription>
              {currentEpisode ? "Update the episode information below." : "Fill in the details to add a new episode."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div className="grid gap-2">
                <Label>Podcast Series</Label>
                <Select value={formData.podcastId as string} onValueChange={handlePodcastChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select podcast series" />
                  </SelectTrigger>
                  <SelectContent>
                    {podcasts
                      .map((podcast) => (
                        <SelectItem key={podcast._id} value={podcast._id}>
                          {podcast.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="number">Episode Number</Label>
                  <Input
                    id="number"
                    name="number"
                    type="number"
                    value={formData.number}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date">Release Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.publishedAt}
                    onChange={handleInputChange}
                    
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="requiredTier">Required Tier</Label>
                  <Select
                    value={formData.requiredTier?.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, requiredTier: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Free (0)</SelectItem>
                      <SelectItem value="1">Basic (1)</SelectItem>
                      <SelectItem value="2">Premium (2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Cover Image</Label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="h-24 w-24 rounded overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Cover Image
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="audio">Audio File</Label>
                <div className="flex items-center gap-4">
                  {audioPreview && ( // <-- this may be audioPreview
                    <div className="flex items-center gap-2">
                      <audio controls src={audioPreview}></audio>
                    </div>
                  )}
                  <Button type="button" variant="outline" onClick={() => audioInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Audio File
                  </Button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleAudioChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Host</Label>
                <Select value={formData.host as string} onValueChange={handleHostChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select host" />
                  </SelectTrigger>
                  <SelectContent>
                    {people
                      .filter((p) => p.role === "host")
                      .map((person) => (
                        <SelectItem key={person._id} value={person._id}>
                          {person.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Guests</Label>
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {people
                      .filter((p) => p.role === "guest" || p.role === 'both')
                      .map((person) => (
                        <div key={person._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`guest-${person._id}`}
                            checked={Boolean((formData.guests as string[]).includes(person._id))}
                            onCheckedChange={() => handleGuestsChange(person._id)}
                          />
                          <Label htmlFor={`guest-${person._id}`} className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full overflow-hidden">
                              <img
                                src={person.imageUrl || "/placeholder.svg"}
                                alt={person.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            {person.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="border rounded-md p-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag._id}
                        className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                          formData.tags.includes(tag._id) ? "text-white" : "text-foreground bg-muted hover:bg-muted/80"
                        }`}
                        style={{
                          backgroundColor: formData.tags.includes(tag._id) ? tag.color : undefined,
                        }}
                        onClick={() => handleTagsChange(tag._id)}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="transcript">Transcript</Label>
                  {isTranscribing && <div className="text-sm text-muted-foreground">Generating transcript...</div>}
                </div>
                <div className="border p-2 rounded bg-muted">
                  {/* <TranscriptEditorJson
                    formData={formData}
                    setFormData={setFormData}
                    isTranscribing={isTranscribing}
                  /> */}
                  <TranscriptEditor transcription={formData.transcription} onUpdate={updateTranscription} />

                  {/* <pre className="whitespace-pre-wrap font-sans">{formatTranscript(formData.transcription)}</pre> */}

                  {/* <TranscriptEditor
                  transcription={formData.transcription}
                  onSave={() => {}}/> */}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isTranscribing || isSubmitting}>
              {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {currentEpisode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  currentEpisode ? "Update" : "Add"
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
              Are you sure you want to delete the episode "{currentEpisode?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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

function url2Key (url: string, collection: string): string {
 return `${collection}/${url.split("episode/")[1]}`
}

export default EpisodesAdmin

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = 'xxxxxxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
  return timestamp + random;
}
