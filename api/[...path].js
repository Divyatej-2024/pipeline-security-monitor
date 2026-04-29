const { buildApp } = require("../server/app");

const app = buildApp();

module.exports = (req, res) => app(req, res);
