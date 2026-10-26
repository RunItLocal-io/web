import { ImageResponse } from "next/og";
import { Die } from "@/lib/die";

// Home-screen icon on iPhone and iPad, and the icon iMessage shows beside shared links.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<Die size={180} />, size);
}
