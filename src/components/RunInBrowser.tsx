import ShareButton from "@/components/ShareButton";
import { SITE } from "@/lib/share";

// The homepage call to action: one button that opens the Studio, where models run on the visitor's GPU, in a new tab.

export default function RunInBrowser({ gpuName }: { gpuName: string | null }) {
  return (
    <div className="try-studio">
      <a className="btn try-btn" href="/studio" target="_blank" rel="noopener">
        <span className="play" aria-hidden="true" />Test it out in the Studio{gpuName ? ` on your ${gpuName}` : ""}
      </a>
      <ShareButton className="linkish" url={SITE} text={`My ${gpuName ?? "computer"} can run AI locally. See what yours can run:`} label="Share this with a friend" />
    </div>
  );
}
