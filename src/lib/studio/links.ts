// The Studio is an app, not a page: on the website every link to it opens it in its own tab, leaving the site where
// it was. The tab is named, so clicking again goes back to that tab instead of opening another copy. (Same origin,
// so no noopener: that would make the browser open a fresh tab every time.) Installed, the app opens straight into
// the Studio, and links back to the site open in the browser.

export const STUDIO = "/studio";

/** The window name every Studio link targets. */
export const STUDIO_TAB = "runitlocal-studio";

/** Extra props for a link: the Studio's own tab when it goes to the Studio. */
export const tabFor = (href: string) => (href === STUDIO ? { target: STUDIO_TAB } : {});
