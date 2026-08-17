export const slugify = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFKD")            // handle diacritics safely
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanum with dashes
    .replace(/(^-|-$)/g, "");    // trim leading/trailing dashes