const { createApp } = require("../server/monitor");

const app = createApp();

module.exports = (req, res) => {
  app(req, res);
};
