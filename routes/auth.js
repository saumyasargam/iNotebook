const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

// Jwt secret for jwt authentication
const JWT_SECRET = "inoteyounote4i@notebook";

// Route 1: Create a user using: POST "./api/auth/createuser". Doesn't require Authentication.
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // // obj = {
    // //     a: 'Thanos',
    // //     number: 34,
    // // }

    // // res.json(obj);
    let success = false;
    console.log(req.body);
    const result = validationResult(req);
    // If there are errors return bad address and the errors
    if (!result.isEmpty()) {
      return res.status(400).json({ success, errors: result.array() });
    }

    try {
      // Check for duplicate email entries
      let user = await User.findOne({ email: req.body.email });
      console.log(user); // returns null if the user is unique ie. not present, else gives back duplicate user
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry! A user already has this email" });
      }

      // generate salt and hashed password
      const salt = await bcrypt.genSalt(10);
      // console.log(salt);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create user to be stored and sent
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      // //   .then(user => res.json(user))
      // //   .catch(err => {console.log(err)
      // // res.json({ error: "Please enter a unique value for email", message: err.message})});
      // // res.send(req.body);

      // // // Save the user data in mongo db
      // // const user = User(req.body);
      // // user.save();
      // // res.send(req.body);

      // data (unique user id in db) for token generation
      const data = {
        user: {
          id: user.id,
        },
      };
      // Generate token using data and JWT_SECRET string
      const authToken = jwt.sign(data, JWT_SECRET);
      // console.log(authToken);
      // res.json(user);
      success = true;
      res.json({ success, authToken }); // Send token itself to validate user
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 2: Create a user using: POST "./api/auth/login". Login endpoint.
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const result = validationResult(req);
    // If there are errors return bad address and the errors
    if (!result.isEmpty()) {
      return res.status(400).json({ success, errors: result.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Please enter correct credentials" });
      }

      console.log(password);
      console.log(" ");
      console.log(user);
      const paswdCompare = await bcrypt.compare(password, user.password);
      if (!paswdCompare) {
        return res
          .status(400)
          .json({ success, error: "Please enter correct credentials" });
      }

      // data (unique user id in db) for token generation
      const data = {
        user: {
          id: user.id,
        },
      };
      // Generate token using data and JWT_SECRET string
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken }); // Send token itself to validate user
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 3: Get logined users deatils using POST "./api/auth/getuser". Login required.
router.post("/getuser", fetchuser, async (req, res) => {
  const result = validationResult(req);
  // If there are errors return bad address and the errors
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
