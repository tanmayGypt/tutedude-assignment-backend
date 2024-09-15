const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const friendRoutes = require("./routes/friends");
// const auth = require("./middleware");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://taupe-cactus-fb9d41.netlify.app",
    credentials: true,
  })
);

const auth = (req, res, next) => {
  const token = req.cookies.profile; // Corrected from req.cookie.profile to req.cookies.profile
  console.log(token);
  if (!token) return res.status(403).send("Access denied");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};
mongoose
  .connect(process.env.MyMongo, {
    useNewUrlParser: true,
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  console.log("Cookies received:", req.cookies);
  res.send("API is running...");
});

app.use("/api/friends", friendRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
