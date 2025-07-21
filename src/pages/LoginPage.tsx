import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-row items-center justify-center gap-6 bg-muted p-6 pb-0 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <LoginForm />
      </div>
    </div>
  )
}