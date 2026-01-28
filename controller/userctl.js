const userm = require("../model/usermod");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
const sgmail = require("@sendgrid/mail");
sgmail.setApiKey(process.env.SENDGRID_API_KEY);

let generateToken = (_id) => {
  return jwt.sign({ _id }, process.env.JwtSecretkey, { expiresIn: "3d" });
};
let reg = async (req, res) => {
  const { email, name, pwd } = req.body || {};
  if (!email || !name || !pwd) {
    return res.status(400).json({ msg: "all field is required" });
  }
  try {
    const existuser = await userm.findOne({ email: email });
    if (existuser) {
      return res.status(400).json({ msg: "user already exist" });
    }
    let hashpwd = await bcrypt.hash(pwd, 10);
    let data = await userm.create({ email: email, name: name, pwd: hashpwd });
    let tkn = generateToken(data._id);
    const { pwd: pas, ...userobj } = data.toObject();
    res.status(201).json({ token: tkn, userobj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error in adding user" });
  }
};

let login = async (req, res) => {
  const { email, pwd } = req.body || {};
  if (!email || !pwd) {
    return res.status(400).json({ msg: "all field is required" });
  }
  try {
    let obj = await userm.findOne({ email: email });
    if (obj) {
      let sign = await bcrypt.compare(pwd, obj.pwd);
      if (sign) {
        let tkn = generateToken(obj._id);
        const { pwd: pas, ...userobj } = obj.toObject();
        res.status(200).json({ token: tkn, userobj });
      } else {
        res.status(400).json({ msg: "incorrect pass" });
      }
    } else {
      res.status(400).json({ msg: "check email" });
    }
  } catch {
    res.status(500).json({ msg: "error in login" });
  }
};
let getuinfo = async (req, res) => {
  try {
    let usr = await userm.findById(req.user._id).select("-pwd");
    if (!usr) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.status(200).json({ usr });
  } catch {
    res.status(500).json({ msg: "error in registering user" });
  }
};

const sendMail = async (to, subject, text) => {
  try {
    const response = await sgmail.send({
      to: to,
      from: process.env.FROM_EMAIL,
      subject: subject,
      text: text,
    });
    if (response[0].statusCode === 202) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("SendGrid error:", err.response?.body || err.message);
    return false;
  }
};

const otp = () => {
  let result = Math.floor(100000 + Math.random() * 900000) + "";
  let expire = Date.now() + 10 * 60 * 1000;
  return { result, expire };
};

let sendotp = async (req, res) => {
  try {
    if (!req.params.email) {
      return res.status(401).json({ msg: "field is empty" });
    }
    let urs = await userm.findOne({ email: req.params.email });
    if (urs) {
      let { result, expire } = otp();
      await userm.findOneAndUpdate(
        { email: req.params.email },
        {
          $set: {
            resetotp: {
              otp: result,
              expire: expire,
              verified: false,
            },
          },
        },
      );
      const sent = await sendMail(
        urs.email,
        "Password Reset OTP",
        `Your OTP is ${result}`,
      );
      if (!sent) {
        return res.status(500).json({ msg: "Mail sending failed" });
      }
      res.status(200).json({ msg: "otp sent sucessfully" });
    } else {
      res.status(404).json({ msg: "check the mail or register" });
    }
  } catch {
    res.status(500).json({ msg: "somthing went wrong" });
  }
};

let checkotp = async (req, res) => {
  try {
    let user = await userm.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    if (!user.resetotp) {
      return res.status(400).json({ msg: "No OTP request found" });
    }
    if (user.resetotp.expire < Date.now()) {
      await userm.findByIdAndUpdate(
        { _id: user._id },
        { $unset: { resetotp: 1 } },
      );
      return res.status(400).json({ msg: "otp expired" });
    }
    if (user.resetotp.otp !== req.body.otp) {
      return res.status(400).json({ msg: "invalid otp" });
    }
    user.resetotp.verified = true;
    await user.save();
    res.status(200).json({ msg: "valid otp" });
  } catch {
    res.status(500).json({ msg: "somthing went wrong" });
  }
};

let updpass = async (req, res) => {
  try {
    if (req.body.pwd == "") {
      return res.json({ msg: "field is required" });
    }
    let user = await userm.findOne({ email: req.body.email });
    if (!user || !user.resetotp || !user.resetotp.verified) {
      return res.json({ msg: "verification needed" });
    }

    let hashpwd = await bcrypt.hash(req.body.pwd, 10);
    await userm.updateOne(
      { email: req.body.email },
      {
        $set: { pwd: hashpwd },
        $unset: { resetotp: "" },
      },
    );

    res.status(201).json({ msg: "successfully updated" });
  } catch {
    res.status(500).json({ msg: "somthing went wrong" });
  }
};
module.exports = { reg, login, getuinfo, sendotp, checkotp, updpass };
