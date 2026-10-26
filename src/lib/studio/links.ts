// The Studio is an app, not a page: on the website every link to it opens a new tab, leaving the site where it
// was. (Installed, the app opens straight into the Studio, and links back to the site open in the browser.)

export const STUDIO = "/studio";

/** Extra props for a link: a new tab when it goes to the Studio. */
export const tabFor = (href: string) => (href === STUDIO ? { target: "_blank", rel: "noopener" } : {});
