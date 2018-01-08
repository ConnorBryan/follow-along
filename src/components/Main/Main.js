import React, { Component } from "react";
import PropTypes from "prop-types";

import { TICKING_FREQUENCY } from "../../constants";
import { keyify } from "../../util";
import { SemanticWordType } from "../../types";
import SemanticWord from "../SemanticWord";
import "./Main.css";

/**
 * @type MainStateType
 * @property {number} timeline - The representation of how much time has occurred since the beginning of the conversation.
 * @property {boolean} inProgress - Whether or not the timeline is currently ticking.
 */

/**
 * @class Main
 * @desc The primary container for all FollowAlong functionality.
 * @property {MainStateType} state
 * @property {object} speakersById - A map for id => speaker name.
 * @property {number} endOfTimeline - When the timeline should restart automatically.
 * @property {number} ticking - An interval for continuously updating the timeline.
 */
export default class Main extends Component {
  static propTypes = {
    speakers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ),
    utterances: PropTypes.arrayOf(
      PropTypes.shape({
        words: PropTypes.arrayOf(SemanticWordType).isRequired,
        speaker_id: PropTypes.number.isRequired
      })
    )
  };

  static defaultProps = {
    speakers: [],
    utterances: []
  };

  constructor(props) {
    super(props);

    const { speakers, utterances } = this.props;

    this.state = {
      timeline: 0,
      inProgress: false,
      speakers: keyify(speakers),
      utterances: keyify(utterances)
    };

    this.speakersById = speakers.reduce(
      (prev, next) => ({ ...prev, [next.id]: next.name }),
      {}
    );

    // Find the word with the greatest end time of all utterances.
    this.endOfTimeline = utterances.reduce((prev, next) => {
      // Find the end time of the last word of the utterance.
      const lastWord = next.words.reduce((prev, next) => {
        const { duration, start_time } = next;
        const formattedDuration = duration * 1000;
        const formattedStartTime = start_time * 1000;
        const endTime = formattedStartTime + formattedDuration;

        return endTime > prev ? endTime : prev;
      }, 0);
      return lastWord > prev ? lastWord : prev;
    }, 0);
  }

  componentWillUnmount() {
    if (this.ticking) {
      window.clearInterval(this.ticking);
    }
  }

  /**
   * @method getSpeakerById
   * @desc Transform a numerical id to a stringified name.
   * @param {number} id 
   * @returns {string}
   */
  getSpeakerById(id) {
    return this.speakersById[id];
  }

  /**
   * @method progressTimeline
   * @desc A single tick will increase the ms counter of the timeline in state.
   * @returns {undefined}
   */
  progressTimeline = () => {
    this.setState(
      prevState => ({
        timeline: prevState.timeline + TICKING_FREQUENCY
      }),
      () => {
        const { timeline } = this.state;

        if (timeline >= this.endOfTimeline) {
          this.restartTimeline();
        }
      }
    );
  };

  /**
   * @method startTicking
   * @desc Create an interval that causes the timeline to increase.
   * @returns {undefined}
   */
  startTicking() {
    this.ticking = window.setInterval(this.progressTimeline, TICKING_FREQUENCY);
  }

  /**
   * @method stopTicking
   * @desc Cancel the ticking interval.
   * @returns {undefined}
   */
  stopTicking() {
    window.clearInterval(this.ticking);
  }

  /**
   * @method startTimeline
   * @desc Begin the ticking interval after setting progress to true.
   * @return {undefined}
   */
  startTimeline = () => {
    this.setState({ inProgress: true });
    this.startTicking();
  };

  /**
   * @method stopTimeline
   * @desc Clear the ticking interval after setting progress to false.
   * @return {undefined}
   */
  pauseTimeline = () => {
    this.setState({ inProgress: false });
    this.stopTicking();
  };

  /**
   * @method restartTimeline
   * @desc Start the entire process over.
   * @return {undefined}
   */
  restartTimeline = () => {
    this.setState({ timeline: 0 });
    this.pauseTimeline();
  };

  /**
   * @method determineIfActive
   * @desc Based on current timeline status, should a word be emphasized on the screen?
   * @param {SemanticWordType} word
   * @returns {boolean}
   */
  determineIfActive(word) {
    const { timeline } = this.state;

    const { duration, start_time, is_symbol } = word;

    if (is_symbol) return false;

    // Normalize for easier calculation.
    const formattedDuration = duration * 1000;
    const formattedStartTime = start_time * 1000;
    const endTime = formattedStartTime + formattedDuration;

    return timeline >= formattedStartTime && timeline <= endTime;
  }

  /**
   * @method renderStatements
   * @desc Iterate over the provided utterances, returning words that become active as the timeline updates.
   * @returns {Component}
   */
  renderStatements() {
    const { utterances } = this.state;

    const statements = utterances.map(({ __key, speaker_id, words }) => (
      <p key={__key}>
        <strong>{this.getSpeakerById(speaker_id)}</strong>
        <br />
        {words.map((word, index) => {
          const active = this.determineIfActive(word);

          return <SemanticWord key={index} word={word.name} active={active} />;
        })}
      </p>
    ));

    return <section>{statements}</section>;
  }

  render() {
    const { timeline, inProgress } = this.state;

    return (
      <main>
        Timeline: {timeline} <br />
        In progress: {inProgress.toString()} <br />
        <p>
          <button onClick={this.startTimeline} disabled={inProgress}>
            Start
          </button>
          <button onClick={this.pauseTimeline} disabled={!inProgress}>
            Pause
          </button>
          <button onClick={this.restartTimeline} disabled={timeline === 0}>
            Restart
          </button>
        </p>
        {this.renderStatements()}
      </main>
    );
  }
}
