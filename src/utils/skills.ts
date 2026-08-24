export const skillDetailHref = (userId: string, slug: string) => `/skills/${encodeURIComponent(userId)}/${encodeURIComponent(slug)}`;
export const skillPackageHref = (slug: string) => `/skillpackage/${encodeURIComponent(slug)}`;
