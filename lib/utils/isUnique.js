const isUnique = (array, fieldName, fieldValue, isNeedToCompare) => {
  if (!isNeedToCompare) {
    return false;
  }

  if (!Array.isArray(array) || array.length === 0) {
    return true;
  }

  for (const obj of array) {
    if (obj[fieldName] === fieldValue) {
      return false;
    }
  }

  return true;
};

export const isUniqueField = (array, fieldName, fieldValue, isNeedToCompare) => {
  return isUnique(array, fieldName, fieldValue, isNeedToCompare) ? <mark>{fieldValue}</mark> : fieldValue;
};
