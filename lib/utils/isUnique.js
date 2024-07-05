import React from 'react';

const isUnique = (array, fieldName, fieldValue) => {
  if (Array.isArray(array)) {
    for (const obj of array) {
      if (obj[fieldName] === fieldValue) {
        return false;
      }
    }
  }

  return true;
};

export const isUniqueField = (array, fieldName, fieldValue) => {
  return isUnique(array, fieldName, fieldValue) ? <mark>{fieldValue}</mark> : fieldValue;
};
