const { generateToken, generateRefreshToken } = require('../config/authConfig');
const User = require('../model/userModel');
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

//Register
const createUser = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      //Create a new User
      const newUser = await User.create(req.body);
      res.json({
        success: true,
        message: "Tạo người dùng thành công",
        data: {
          _id: newUser._id,
          email: newUser.email,
          fullname: newUser.fullname,
          role: newUser.role,
        }
      });
    }
    else {
      return res.status(400).json({
        success: false,
        message: "Tài khoản đã được đăng ký"
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi trong quá trình đăng kí"
    });
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    //check if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
      const refreshToken = await generateRefreshToken(findUser?.id);
      const updateuser = await User.findByIdAndUpdate(findUser.id, {
        refreshToken: refreshToken,
      }, {
        new: true,
      });
      res.cookie('refreshToken', refreshToken.token, {
        httpOnly: true,
        maxAge: refreshToken.expiryDate,
      })
      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          _id: findUser?._id,
          email: findUser?.email,
          fullname: findUser?.fullname,
          role: findUser?.role,
          token: generateToken(findUser?._id),
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Tài khoản hoặc mật khẩu không đúng"
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi trong quá trình đăng nhập"
    });
  }
});

//Handle Refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  try {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Không đủ quyền truy cập"
      });
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ "refreshToken.token":refreshToken });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Lỗi"
      });
    }
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      const accessToken = generateToken(user?._id);
      const refreshToken = generateRefreshToken(user?.id);
      res.json({
        success: true,
        data: {
          _id: user?._id,
          email: user?.email,
          fullname: user?.fullname,
          role: user?.role,
          token: generateToken(user?._id),
        }
      });
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi !"
    });
  }

});

//Logout functionality
const logout = asyncHandler(async (req, res) => {
  try {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) {
      return res.sendStatus(204);
    }

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ "refreshToken.token":refreshToken });

    if (!user) {
      return res.sendStatus(204);
    }

    // Xóa refreshToken trong cơ sở dữ liệu
    await User.findOneAndUpdate({ refreshToken }, {
      refreshToken: "",
    });

    // Xóa refreshToken trong cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi trong quá trình đăng xuất"
    });
  }
});

module.exports = { createUser, loginUserCtrl, handleRefreshToken, logout };
