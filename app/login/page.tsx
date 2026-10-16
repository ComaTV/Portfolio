import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github", { redirectTo: "/admin" })
      }}
    >
      <button type="submit">Login cu GitHub</button>
    </form>
  )
}