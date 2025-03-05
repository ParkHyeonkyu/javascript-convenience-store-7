function mergeSameItems(purchaseList) {
    const merged = purchaseList.reduce((acc, value) => {
      if (acc[value.name]) {
        acc[value.name].count += value.count;
      } else {
        acc[value.name] = { name: value.name, count: value.count };
      }
      return acc;
    }, {});
  
    return Object.values(merged);
  }
  
  export default mergeSameItems;