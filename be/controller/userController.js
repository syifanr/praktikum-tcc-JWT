import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
async function register(req, res) {
  try {
    const { username, password } = req.body;

    if ( !username || !password) {
      const msg = `${
         !username ? "Username" : "Password"
      } field cannot be empty 😠`;
      const error = new Error(msg);
      error.statusCode = 401;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashPassword,
    });

    res.status(201).json({
      status: "Success",
      message: "User Registered",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      const error = new Error("Username atau password salah 😠");
      error.statusCode = 400;
      throw error;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error("Username atau password salah 😠");
      error.statusCode = 400;
      throw error;
    }

    const userPlain = user.toJSON();
    const { password: _, refresh_token: __, ...safeUserData } = userPlain;

    const accessToken = jwt.sign(safeUserData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1200s",
    });

    const refreshToken = jwt.sign(safeUserData, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    await User.update(
      { refresh_token: refreshToken },
      { where: { id_user: user.id_user } }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: false,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
    });

    res.status(200).json({
      status: "Success",
      message: "Login Berhasil",
      accessToken,
      safeUserData,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}


// LOGOUT
async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  const user = await User.findOne({ where: { refresh_token: token } });
  if (!user) return res.sendStatus(204);

  await User.update({ refresh_token: null }, { where: { id_user: user.id_user } });

  res.clearCookie("refreshToken");
  res.sendStatus(200);
}

export async function updateUser(req, res) {
  try {
    const { username } = req.params;
    const { username: newUsername, password } = req.body;

    const ifUserExist = await User.findOne({ where: { username } });

    if (!newUsername || !password) {
      const msg = `${
        !newUsername ? "Username" : "Password"
      } field cannot be empty 😠`;
      const error = new Error(msg);
      error.statusCode = 401;
      throw error;
    }

    if (!ifUserExist) {
      const error = new Error("User tidak ditemukan 😮");
      error.statusCode = 400;
      throw error;
    }

    await User.update(
      { username: newUsername, password },
      { where: { username } }
    );

    res.status(200).json({
      status: "Success",
      message: "User Updated",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const { username } = req.params;
    const ifUserExist = await User.findOne({ where: { username } });

    if (!ifUserExist) {
      const error = new Error("User tidak ditemukan 😮");
      error.statusCode = 400;
      throw error;
    }

    await User.destroy({ where: { username } });

    res.status(200).json({
      status: "Success",
      message: "User Deleted",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
}

export { register, login, logout };
