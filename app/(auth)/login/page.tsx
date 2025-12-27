import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/verify";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "admin") return redirect("/admin");
    if (user.role === "professional") return redirect("/professional");
  }
  return (
    <div>
      <h1>Login</h1>
      <p>Please log in to continue.</p>
      {/* TODO: Add login form here */}
    </div>
  );
}
