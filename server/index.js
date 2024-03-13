import express from "express";
import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import StudentModel from "./models/students.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

mongoose
  .connect("mongodb://0.0.0.0:27017/DBSTUDENT")
  .then(() => console.log("db Students connected"))
  .catch(() => console.log("error"));

app.post("/register", (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    StudentModel.create({
      name: name,
      email: email,
      password: password,
    });
    res.send("Added in db successfully");
  } catch (err) {
    console.log("err");
    res.send("internal server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let findData = await StudentModel.findOne({ email: email });
    if (findData) {
      if (findData.password === password) {
        const accessToken = Jwt.sign(
          { email: email },
          "jwt-access-token-secret-key",
          { expiresIn: "1m" }
        );
        const refreshToken = Jwt.sign(
          { email: email },
          "jwt-refresh-token-secret-key",
          { expiresIn: "5m" }
        );
        res.cookie("accessToken", accessToken, { maxAge: 50000 });
        res.cookie("refreshToken", refreshToken, {
          maxAge: 300000,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        // res.json("Login SuccessFully");
        return res.json({ Login: true });
      } else {
        res.json({ Login: false, Message: "Password did not match " });
      }
    } else {
      res.json({ Login: false, Message: "user not found " });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("internal server error");
  }
});

const varifyUser = (req, res, next) => {
  const accesstoken = req.cookie.accessToken;
  if (!accesstoken) {
  } else {
    Jwt.verify(accesstoken, "jwt-access-token-secret-key", (err, decoded) => {
      if (err) {
        return res.json({ valid: false, message: "Invalid Token" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

const renewToken = (req, res) => {
  const refreshtoken = req.cookie.refreshToken;
  if (!refreshtoken) {
    return res.json({ valid: false, messgae: "No Refresh Token" });
  } else {
    Jwt.verify(accesstoken, "jwt-refresh-token-secret-key", (err, decoded) => {
      console.log(err, decoded);
      if (err) {
        return res.json({ valid: false, message: "Invalid Refresh Token" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

// app.use(varifyUser());

app.get("dashboard", (req, res) => {
  return res.json({ valid: true, message: "authorized" });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(3001, () => {
  console.log("server running at 3001");
});
