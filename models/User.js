const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ from: mongoose.Schema.Types.ObjectId, status: String }],
});

module.exports = mongoose.model("User", UserSchema);
