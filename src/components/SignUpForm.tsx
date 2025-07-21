"use client";
import React from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { Label } from "./ui/aceternity/label";
import { Input } from "./ui/aceternity/input";
import { cn } from "@/lib/utils";
 
export function SignupFormDemo() {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const navigate = useNavigate();

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
    const name = document.getElementById('firstName') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    const passwordValue = password.value;
    const hasUpperCase = /[A-Z]/.test(passwordValue);
    const hasLowerCase = /[a-z]/.test(passwordValue);
    const hasNumbers = /\d/.test(passwordValue);
    const isLongEnough = passwordValue.length >= 8;

    if (!passwordValue) {
      setPasswordError(true);
      setPasswordErrorMessage('Password is required.');
      isValid = false;
    } else if (!isLongEnough) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 8 characters long.');
      isValid = false;
    } else if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must contain uppercase, lowercase and number.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (password.value !== confirmPassword.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords must match');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (nameError || emailError || passwordError || confirmPasswordError) {
      return;
    }
    const data = new FormData(e.currentTarget);
    try {
      await authService.register(
        data.get('email') as string, 
        data.get('password') as string, 
        data.get('firstName') as string, 
        data.get('lastName') as string || ''
      );
      navigate('/login');
    } catch (err) {
      // redirect somewhere
    }
  };


  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to PodcastHub
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
      </p>
 
      <form className="mt-8" onSubmit={handleSubmit} noValidate>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" 
              name="firstName"
              required
              placeholder="Bob" 
              type="text" />
              {nameError && (
            <p className="text-xs text-red-500">{nameErrorMessage}</p>
          )}
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" 
              name="lastName"
              placeholder="Marley" 
              type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" 
          name="email"
          required
          placeholder="bob.marley@thewailers.com" 
          type="email" />
          {emailError && (
            <p className="text-xs text-red-500">{emailErrorMessage}</p>
          )}
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" 
            name="password"
            required
            placeholder="••••••••" 
            type="password" />
            {passwordError && (
              <p className="text-xs text-red-500">{passwordErrorMessage}</p>
            )}
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            required
            name="confirmPassword"
            placeholder="••••••••"
            type="password"
          />
          {confirmPasswordError && (
            <p className="text-xs text-red-500">{confirmPasswordErrorMessage}</p>
          )}
        </LabelInputContainer>
        <div className="grid gap-6">
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            onClick={validateInputs}
          >
            Sign up &rarr;
            <BottomGradient />
          </button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Sign In
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
 
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};
 
const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};