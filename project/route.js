import express from "express";
import User from "./model/user.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  res.json("message for get request ");
});

router.post("/adddata", async (req, res) => {
  try {
    console.log("inside loop ");

    const userdata = await User.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId("670ea7a98ff84e264307fb31"),
          },
          update: {
            $push: { customers: "asda" }, // Ensure atomic operator is correctly used
          },
          upsert: false // O
        }
      },
    ]);

    console.log("user data ", userdata);
    res.status(200).json(userdata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/getdata", async (req, res) => {
  try {
    console.log("inside server ");
    const data = await User.find();
    console.log("data ", data);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
