import PropTypes from "prop-types";

/**
 * @type SemanticWordType
 * @property {number} start_time - The point on the timeline where the word is "active".
 * @property {number} duration - The point on the timeline where the word become "inactive".
 * @property {boolean} is_symbol - Whether the word should be ignored.
 * @property {string} name - The word itself.
 */
export const SemanticWordType = PropTypes.shape({
  start_time: PropTypes.number,
  duration: PropTypes.number,
  is_symbol: PropTypes.bool,
  name: PropTypes.string.isRequired
});
