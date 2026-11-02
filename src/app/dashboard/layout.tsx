import { redirect } from "next/navigation";
import { pageUser } from "@/lib/page-user";
import Shell from "./WorkspaceShell";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await pageUser();
  if (!user) redirect("/login?redirect=%2Fdashboard");
  return <Shell>{children}</Shell>;
}
