const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Promoter = require("../models/Promoter");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

router.post("/promoter/signup", fileUpload(), async (req, res) => {
  console.log(req.body);

  try {
    const promoter = await Promoter.findOne({ email: req.body.email });

    if (promoter) {
      res.status(409).json({ message: "This email already has an account" });
    } else {
      if (req.body.email && req.body.password && req.body.username) {
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(req.body.password + salt).toString(encBase64);

        const newPromoter = new Promoter({
          email: req.body.email,
          token: token,
          hash: hash,
          salt: salt,
          account: { username: req.body.username },
        });

        if (req.files?.avatar) {
          const result = await cloudinary.uploader.upload(
            convertToBase64(req.files.avatar),
            {
              folder: `/show/promoters/${newPromoter._id}`,
              public_id: "avatar",
            }
          );
          newPromoter.account.avatar = result;
        }

        await newPromoter.save();

        res.status(201).json({
          _id: newPromoter._id,
          email: newPromoter.email,
          token: newPromoter.token,
          account: newPromoter.account,
        });
      } else {
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/promoter/login", async (req, res) => {
  try {
    const promoter = await Promoter.findOne({ email: req.body.email });

    if (promoter) {
      if (
        SHA256(req.body.password + promoter.salt).toString(encBase64) ===
        promoter.hash
      ) {
        res.status(200).json({
          _id: promoter._id,
          token: promoter.token,
          account: promoter.account,
        });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "Promoter not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
