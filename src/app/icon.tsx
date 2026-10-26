import { ImageResponse } from "next/og";
import { Die } from "@/lib/die";

// Browser-tab icon: the die from the app icon, drawn edge to edge so it reads at 16-32px.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<Die size={64} tight />, size);
}
