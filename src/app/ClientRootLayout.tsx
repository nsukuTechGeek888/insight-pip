"use client";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { UserProvider } from "@/contexts/UserContext";
import PlatformNav from "@/components/PlatformNav";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import Feedback from "@/components/ui/Feedback";
export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <UserProvider>
        <NavigationProvider>
          <div className="v2-app">
            {process.env.NEXT_PUBLIC_QA_MODE === "1" && (
              <div className="v2-qa-banner" role="status">
                <strong>ISOLATED QA ENVIRONMENT</strong>
                <span>
                  Fictional providers, reviews and trading conditions. For
                  application evaluation only.
                </span>
              </div>
            )}
            <PlatformNav />
            <Feedback />
            <main id="main-content">{children}</main>
            <footer className="v2-footer">
              <div>
                <strong>InsightPip</strong>
                <p>Better research. More informed decisions.</p>
              </div>
              <div>
                <Link href="/methodology">Trust & transparency</Link>
                <Link href="/incidents">Incident centre</Link>
                <Link href="/blog">Research & learning</Link>
              </div>
              <p>
                Trading involves risk. Ratings and reviews are research inputs,
                not guarantees. Offers may contain affiliate links.
              </p>
            </footer>
          </div>
        </NavigationProvider>
      </UserProvider>
    </MotionConfig>
  );
}
