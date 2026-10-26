import type { Metadata } from "next";
import StudioApp from "@/components/studio/StudioApp";
import StudioChrome from "@/components/studio/StudioChrome";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio",
  description: "Make images and chat with AI models running on your own GPU, in your browser. Installable, and works offline.",
};

// A full-window app: studio.css hides the site's nav and footer while it's open.
export default function Studio() {
  return (
    <>
      <StudioChrome />
      <StudioApp />
    </>
  );
}
