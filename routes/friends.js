const express = require("express");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware");
const mongoose = require("mongoose");
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ username: { $ne: req.body.userId } });
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: "Error fetching users", error: err });
  }
});

router.post("/add-friend", async (req, res) => {
  const { friendId, userId } = req.body;

  try {
    const user = await User.findOne({ username: userId });
    const user2 = await User.findById(friendId);

    if (!user || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyFriend = user.friends.indexOf(user2._id);
    // Check if friend request is already sent
    const isRequestAlreadySent = user2.friendRequests.indexOf(user._id);
    console.log(user2.friendRequests);
    console.log(user.friends);
    if (isAlreadyFriend > -1) {
      return res.status(400).json({ message: "Already friends" });
    }
    if (isRequestAlreadySent > -1) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    user2.friendRequests.push(user._id);
    await user2.save();

    return res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    return res.status(500).json({ message: "Error adding friend", error: err });
  }
});

router.post("/accept-friend", async (req, res) => {
  const { friendId, userId } = req.body;

  try {
    // Find users by their IDs
    const user = await User.findOne({ username: userId });
    const user2 = await User.findById(friendId);

    if (!user || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the friend request exists
    const friendRequestIndex = user.friendRequests.findIndex((id) =>
      id.equals(user2._id)
    );
    if (friendRequestIndex !== -1) {
      user.friendRequests.splice(friendRequestIndex, 1); // No need to reassign
    }
    const isAlreadyFriend = user.friends.some((id) => id.equals(user2._id));
    const isAlreadyFriendUser2 = user2.friends.some((id) =>
      id.equals(user._id)
    );

    // Remove friend request if it exists

    // Add user2 to user's friends if not already present
    if (!isAlreadyFriend) {
      user.friends.push(user2._id);
    }

    // Add user to user2's friends if not already present
    if (!isAlreadyFriendUser2) {
      user2.friends.push(user._id);
    }
    console.log(isAlreadyFriend, isAlreadyFriendUser2, friendRequestIndex);
    // Save both users
    await user.save();
    await user2.save();

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    return res.status(500).json({
      message: "Error accepting friend request",
      error: err.message,
    });
  }
});

router.get("/friends", async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "Invalid User" });
    }

    const user = await User.findOne({ username: userId }).populate("friends");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.friends);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching friends", error: err });
  }
});

router.post("/add-friend", async (req, res) => {
  const { friendId, userId } = req.body;

  try {
    const user = await User.findOne({ username: userId });
    const user2 = await User.findById(friendId);

    if (!user || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyFriend = user.friends.indexOf(user2._id);
    // Check if friend request is already sent
    const isRequestAlreadySent = user2.friendRequests.indexOf(user._id);
    console.log(user2.friendRequests);
    console.log(user.friends);
    if (isAlreadyFriend > -1) {
      return res.status(400).json({ message: "Already friends" });
    }
    if (isRequestAlreadySent > -1) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    user2.friendRequests.push(user._id);
    await user2.save();

    return res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    return res.status(500).json({ message: "Error adding friend", error: err });
  }
});

router.post("/unfriend", async (req, res) => {
  const { friendId, userId } = req.body;

  try {
    const user = await User.findOne({ username: userId });
    const user2 = await User.findById(friendId);

    if (!user || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    // const i1 = user.friendRequests.indexOf(user2._id);
    const i2 = user.friends.indexOf(user2._id);

    if (i2 > -1) {
      console.log(i2);
      user.friends.splice(i2, 1); // Add friend to the user's list
    }

    // Update the second user's friend list to include the first user
    const i3 = user2.friends.indexOf(user._id);
    if (i3 > -1) {
      user2.friends.splice(i3, 1); // Add user to the second user's friend list
      console.log(i3);
    }
    await user.save();
    await user2.save();
    return res.status(200).json({ message: "unfriend successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Error accepting friend request",
      error: err.message,
    });
  }
});
module.exports = router;
