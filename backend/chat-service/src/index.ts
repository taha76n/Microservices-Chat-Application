import express from "express";
import { config } from "./configs/index.js";

const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Hello from index.js of chat-service</h1>")
})

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`); 
})