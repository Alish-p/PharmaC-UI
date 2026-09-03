export function getAllItems({ data }) {
  const items = [];

  function traverse(item, parentTitles, subheader, icon) {
    const currentBreadcrumbs = [...parentTitles, item.title];
    const itemIcon = item.icon || item.info || icon;

    // Only index leaf nodes (items without children) to avoid search result duplication
    if (!item.children || item.children.length === 0) {
      items.push({
        group: parentTitles[0] || subheader,
        title: item.title,
        path: item.path,
        icon: itemIcon,
        breadcrumbs: [subheader, ...currentBreadcrumbs].join(' > '),
      });
    }

    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => {
        traverse(child, currentBreadcrumbs, subheader, itemIcon);
      });
    }
  }

  data.forEach((group) => {
    group.items?.forEach((item) => {
      traverse(item, [], group.subheader, item.icon);
    });
  });

  return items;
}

// ----------------------------------------------------------------------

export function applyFilter({ inputData, query }) {
  if (query) {
    inputData = inputData.filter(
      (item) =>
        item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        item.breadcrumbs.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}

// ----------------------------------------------------------------------

export function groupItems(array) {
  const group = array.reduce((groups, item) => {
    groups[item.group] = groups[item.group] || [];

    groups[item.group].push(item);

    return groups;
  }, {});

  return group;
}

