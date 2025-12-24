function extractHashtags(caption = "") {
  const matches = caption.match(/#\w+/g) || [];
  return matches.map(tag => tag.slice(1));
}

module.exports = {
  extractHashtags,
};
