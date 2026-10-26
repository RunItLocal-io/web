// What the Studio checks before it downloads anything: in-app browsers (Facebook, Instagram, Line and other iOS
// web views give a page far too little to load a model), and connections where a multi-GB download costs money.

/** Facebook, Instagram and Line say so in the user agent. Other iOS web views are WebKit without "Safari". */
export function inAppBrowser(ua = navigator.userAgent): boolean {
  if (/FBAN|FBAV|FB_IAB|Instagram|\bLine\//i.test(ua)) return true;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  // A home-screen web app on iOS also leaves out "Safari", and it's a real browser.
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone || matchMedia("(display-mode: standalone)").matches;
  return ios && /AppleWebKit/.test(ua) && !/Safari\//.test(ua) && !standalone;
}

/** A coarse browser name for analytics. Nothing more specific than this is sent. */
export function uaFamily(ua = navigator.userAgent): string {
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return "facebook";
  if (/Instagram/.test(ua)) return "instagram";
  if (/\bLine\//.test(ua)) return "line";
  if (/Edg\//.test(ua)) return "edge";
  if (/OPR\//.test(ua)) return "opera";
  if (/Firefox\/|FxiOS/.test(ua)) return "firefox";
  if (/Chrome\/|CriOS/.test(ua)) return "chrome";
  if (/Safari\//.test(ua)) return "safari";
  if (/AppleWebKit/.test(ua)) return "webview";
  return "other";
}

type Conn = { saveData?: boolean; type?: string; effectiveType?: string };

/** Data Saver is on, or the browser says it's on a cellular connection. Most browsers report neither. */
export function metered(): boolean {
  const c = (navigator as Navigator & { connection?: Conn }).connection;
  return !!c && (c.saveData === true || c.type === "cellular");
}

/** The model's size in MB, from its label ("2.5 GB"). */
export const sizeMb = (size: string) => Math.round(parseFloat(size) * (/GB/i.test(size) ? 1000 : 1));
