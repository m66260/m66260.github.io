module.exports = function override(config) {
  return {
    ...config,
    ignoreWarnings: [/Failed to parse source map/],
  };
};
