const REACTION_TYPES = Object.freeze({
  THUMBS_UP: "👍",
  LAUGH: "😂",
  SURPRISE: "😮",
  HEART: "❤️",
  SAD: "😢",
});

const ALLOWED_REACTIONS = Object.freeze(Object.values(REACTION_TYPES));

module.exports = { REACTION_TYPES, ALLOWED_REACTIONS };
