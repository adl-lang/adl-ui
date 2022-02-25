/** Used to generate unique IDs. */
const idCounter: Record<string,number> = {};

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 * Note: Extracted from lodash src
 *
 * @since 0.1.0
 * @category Util
 * @param [prefix=''] The value to prefix the ID with.
 * @returns Returns the unique ID.
 * @example
 *
 * uniqueId('contact_')
 * // => 'contact_104'
 *
 * uniqueId()
 * // => '105'
 */
export const uniqueId = (prefix = "$lodash$") => {
  if (!idCounter[prefix]) {
    idCounter[prefix] = 0;
  }

  const id = ++idCounter[prefix];
  if (prefix === "$lodash$") {
    return `${id}`;
  }

  return `${prefix + id}`;
};
