export interface User {
    id: string
    email: string
    password?: string
    firstName: string
    lastName: string
    role: string
    subcriptionTier?: number
    bookmarks?: object[]
}