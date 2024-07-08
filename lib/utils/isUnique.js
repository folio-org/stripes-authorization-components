import React from 'react';

const isUnique = (array, fieldName, fieldValue, isNeedToCompare) => {
  if (isNeedToCompare) {
    if (Array.isArray(array)) {
      for (const obj of array) {
        if (obj[fieldName] === fieldValue) {
          return false;
        }
      }
    }

    return true;
  }
  return false;
};

export const isUniqueField = (array, fieldName, fieldValue, isNeedToCompare) => {
  return isUnique(array, fieldName, fieldValue, isNeedToCompare) ? <mark>{fieldValue}</mark> : fieldValue;
};
