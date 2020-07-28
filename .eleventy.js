module.exports = function (config) {
  config.addPassthroughCopy("src/assets");
  return {
    pathPrefix: "/healthenews/",
    dir: {
      input: "src",
    },
  };
};
