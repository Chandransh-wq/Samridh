const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const { default: Auth } = require("./Routes/Auth");
const { default: router } = require("./Routes/UserRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: [
      "https://samridh.netlify.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", Auth);
app.use("/user", router);

app.get("/", (req, res) => {
  res.send("Welcome to HEELOS backend!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
