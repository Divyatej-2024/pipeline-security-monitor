const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const { createApp } = require("./server/monitor");

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const app = createApp();

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Pipeline Security Monitor listening on ${PORT}`);
});
