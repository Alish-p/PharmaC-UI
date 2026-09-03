import { usePathname } from './use-pathname';
import { hasParams, removeParams, isExternalLink, removeLastSlash } from '../utils';

// ----------------------------------------------------------------------
export function useActiveLink(itemPath, deep = true) {
  const pathname = removeLastSlash(usePathname());

  const pathHasParams = hasParams(itemPath);

  /* Start check */
  const notValid = itemPath.startsWith('#') || isExternalLink(itemPath);

  if (notValid) {
    return false;
  }
  /* End check */

  const isDeep = deep || pathHasParams;

  if (isDeep) {
    // Exact match for the path
    const exactMatch = pathname === itemPath;

    // Ensure the itemPath is a parent path with a valid `/` separator
    const parentMatch = pathname.startsWith(`${itemPath}/`) || pathname === itemPath;

    // Deep match for params
    const originItemPath = removeParams(itemPath);
    const hasParamsActive = pathHasParams && originItemPath === pathname;

    return exactMatch || parentMatch || hasParamsActive;
  }

  // For shallow match, ensure exact match
  return pathname === itemPath;
}
