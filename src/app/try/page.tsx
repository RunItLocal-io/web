import type { Metadata } from "next";
import ChatDemo from "@/components/ChatDemo";
import { PageHead, SiteFooter, SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Try our rack",
  description: "Chat with big open models running on our own used GPUs, not a cloud API.",
};

export default function Try() {
  return (
    <div className="wrap">
      <SiteNav />
      <section id="try">
        <PageHead kicker="Live on our rack" title="Try it before you buy anything">
          This runs on our own used GPUs, not a cloud API. The receipt under each answer shows what it took.
        </PageHead>
        <ChatDemo />
      </section>
      <SiteFooter />
    </div>
  );
}
