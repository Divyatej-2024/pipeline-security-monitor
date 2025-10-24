import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;
  console.log(`Received ${event} event`);
  res.sendStatus(200);
});
app.listen(4000, () => console.log("Listening on port 4000"));
