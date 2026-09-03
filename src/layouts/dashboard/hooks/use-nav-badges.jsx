// ----------------------------------------------------------------------

export function useNavBadges() {
  const injectBadges = (navSections) => {
    if (!navSections) return [];
    return navSections;
  };

  return { injectBadges };
}
