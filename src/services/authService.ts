import { API } from './api.ts'
import { toast } from 'sonner'
import type { User } from '../types/user'

let setUserCallback: (user: User | null) => void = () => {};

export const setAuthUserUpdater = (callback: (user: User | null) => void) => {
  setUserCallback = callback;
};

const handleError = (err: unknown) => {
  let message = 'Something went wrong. Please try again.';

  if (err && typeof err === 'object' && 'response' in err && 
    err.response && typeof err.response === 'object' && 
    'data' in err.response && err.response.data && 
    typeof err.response.data === 'object' && 
    'error' in err.response.data) {
  message = err.response.data.error as string;
}

  toast.error(message); // global error notification
  throw new Error(message); // Optional: still allow local catch
};

// Register new user
const register = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    const res = await API.post('/auth/register', { email, password, firstName, lastName });
    toast.success("Registration successful")
    return res.data;
  } 
  catch(err) {
    handleError(err);
  }
};

// Login user (server sets HttpOnly cookie)
const login = async (email: string, password: string) => {
  try{
    const res = await API.post('/auth/login', { email, password });
    toast.success("Login successful")
    setUserCallback(res.data.user);
    return res.data;
  } 
  catch(err) {
    setUserCallback(null)
    handleError(err);
  }
};

// Logout user (clears the HttpOnly cookie)
const logout = async () => {
  try {
    await API.post('/auth/logout');
    setUserCallback(null);
    toast.success("User Logged out")
  }
  catch(err) {
    handleError(err)
  }
};

// Get current authenticated user (from JWT in cookie)
const getCurrentUser = async () => {
  try {
    const res = await API.get('/auth/me');
    setUserCallback(res.data);
    return res.data;
  }
  catch(err) {
    setUserCallback(null);
  }
};

export const authService = {
  setAuthUserUpdater,
  register,
  login,
  logout,
  getCurrentUser,
};
