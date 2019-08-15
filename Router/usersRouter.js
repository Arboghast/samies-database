const jwt = require("jsonwebtoken");
const config = require("config");
const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const router2 = express.Router();
const { users, validate } = require("../Database/Models/Users");
const auth = require("../Middlewares/authMid");

router2.post("/", async (req, res) => {
  //auth,
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await users.findOne({ where: { email: req.body.email } });
  if (user) return res.status(400).send("User already registered.");

  console.log(req.body);
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  console.log(req.body);

  try {
    let new_user = await users.create(req.body);
    const token = jwt.sign(
      {
        id: new_user.id,
        email: new_user.email
      },
      "myJwtKey"
      // config.get("jwtKey")
    );
    res
      .header("x-auth-token", token)
      .send(_.pick(new_user, ["id", "name", "email"]));
  } catch (error) {
    res.send(error);
  }
});

router2.get("/", async (req, res) => {});

module.exports = router2;
