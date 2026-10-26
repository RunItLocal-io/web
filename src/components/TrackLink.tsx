"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics";

// A <Link> that sends an Umami event on click. Don't put data-umami-event on a same-tab link: the tracker cancels
// the click and reloads the page itself, which loses Next's client navigation and the Studio's named tab.

type Props = ComponentProps<typeof Link> & { event: string; data?: Record<string, string | number> };

export default function TrackLink({ event, data, onClick, ...rest }: Props) {
  return <Link {...rest} onClick={e => { track(event, data); onClick?.(e); }} />;
}
