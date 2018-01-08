import React from "react";
import PropTypes from "prop-types";

/**
 * @func SemanticWord
 * @desc A visual representation of a semantic word object that has markers for when to animate.
 * @returns {Component}
 */
function SemanticWord({ word, active }) {
  const className = active ? "SemanticWord-active" : null;

  return <span className={className}>{word}</span>;
}

SemanticWord.propTypes = {
  word: PropTypes.string.isRequired,
  active: PropTypes.bool
};

export default SemanticWord;
