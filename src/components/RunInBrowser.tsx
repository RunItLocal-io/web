import QuickShare from "@/components/QuickShare";
import { STUDIO, tabFor } from "@/lib/studio/links";

// The homepage call to action: one button that opens the Studio, where models run on the visitor's GPU, in its own tab.

export default function RunInBrowser({ gpuName }: { gpuName: string | null }) {
  return (
    <div className="try-studio">
      <a className="btn try-btn" href={STUDIO} {...tabFor(STUDIO)}>
        <span className="play" aria-hidden="true" />Test it out in the Studio{gpuName ? ` on your ${gpuName}` : ""}
      </a>
      <QuickShare className="linkish" path="/" page="home" text={`My ${gpuName ?? "computer"} can run AI locally. See what yours can run:`} label="Share this with a friend" />
    </div>
  );
}
