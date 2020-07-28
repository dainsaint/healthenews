const marked = require('marked');

module.exports = function (config) {
  config.addPassthroughCopy("src/assets");

  config.addFilter("markdown", function(string) {
    return string ? marked(string) : string;
  })

  return {
    pathPrefix: "/healthenews/",
    dir: {
      input: "src",
    },
  };
};
