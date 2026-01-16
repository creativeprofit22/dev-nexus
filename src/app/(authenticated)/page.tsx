import { redirect } from "next/navigation";

export default function AuthenticatedRootPage() {
  // Redirect to projects as the default authenticated page
  redirect("/projects");
}
