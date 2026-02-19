const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const { default: Auth } = require("./Routes/Auth");
const { default: User } = require("./Routes/User");
const { default: api } = require("./Routes/api");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: ["https://samridhwk.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", Auth);
app.use("/user", User);
app.use("/api", api);

app.get("/", (req, res) => {
  res.send("Welcome to HEELOS backend!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
