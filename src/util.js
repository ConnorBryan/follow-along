import uuid from "uuid/v4";

/**
 * @func keyify
 * @desc Adds a uniquely generated key to an array of objects for purposes of indexing.
 * @param {Array<object>}
 * @returns {Array<object>}
 */
export function keyify(array) {
  return array.map(item => ({ ...item, __key: uuid() }));
}
