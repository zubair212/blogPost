const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const UserDTO = require('../dto/user'); // Correct import path to dto/user.js
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
const JWTService = require('../services/JWTServices');
const Refreshtoken = require('../models/token');

const authcontroller = {
  async register(req, res, next) {
    // Validate user input
    const userRegistrationSchema = Joi.object({
      username: Joi.string().min(4).max(24).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref('password') // Fix the typo in 'conforimPassword'
    });

    // Validate the request body against the schema
    const { error } = userRegistrationSchema.validate(req.body);

    // Error validations
    if (error) {
      return next(error);
    }

    const { username, name, email, password } = req.body;

    try {
      // Check if email and username are already registered
      const emailInUse = await User.exists({ email });
      const userNameInUse = await User.exists({ username });

      if (emailInUse) {
        const error = {
          status: 409,
          message: 'Email already registered, use another email'
        };
        return next(error);
      }

      if (userNameInUse) {
        const error = {
          status: 409,
          message: 'Username is not available, choose another username'
        };
        return next(error);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // User registration in the database

      let accessToken;
      let refreshToken;
      let user;
      try {


        const userToRegister = new User({
          username,
          email,
          name,
          password: hashedPassword
        });

        user = await userToRegister.save();


        //token genartions
        accessToken = JWTService.signAccessToken({ _id: user._id }, '30m');

        refreshToken = JWTService.signRefreshToken({ _id: user._id }, '60m');

      } catch (error) {
        return next(error);
      }
      // stor'e token in database

      await JWTService.storeRefreshToke(refreshToken, user._id);


      //send token in cookies

      res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httponly: true
      });

      res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httponly: true
      });

      // Respond with the registered user details
      const userDTO = new UserDTO(user); // Create a new UserDTO object
      return res.status(201).json({ user: userDTO, auth: true });

    } catch (error) {
      return next(error);
    }
  },

  // login
  async login(req, res, next) {
    const userLoginSchema = Joi.object({
      username: Joi.string().min(4).max(24).required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });

    // Validate the request body against the schema
    const { error } = userLoginSchema.validate(req.body);

    // Error validations
    if (error) {
      return next(error);
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username: username });

      if (!user) {
        const error = {
          status: 401,
          message: 'Invalid username',
        };
        return next(error);
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: 'Invalid password',
        };
        return next(error);
      }





      const accessToken = JWTService.signAccessToken({ _id: user._id }, '30m');

      const refreshToken = JWTService.signRefreshToken({ _id: user._id }, '60m');


      //update refresh token in database

      try {

        await Refreshtoken.updateOne({

          _id: user._id

        },
          { token: refreshToken },
          { upsert: true }

        )

      } catch (error) {
        return next(error);
      }



      res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httponly: true
      });

      res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httponly: true
      });




      const userDTO = new UserDTO(user); // Create a new UserDTO object
      // If login is successful, respond with user details
      return res.status(200).json({ user: userDTO, auth: true });
    } catch (error) {
      return next(error);
    }




  },
  async logout(req, res, next) {
    console.log(req);
    // delete refreshToken in database
    const { refreshToken } = req.cookies;

    try {
      await Refreshtoken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }

    // delete cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // respond with a null user and auth status false
    res.status(200).json({ user: null, auth: false });
  },

  async refresh(req, res, next) {
    const originalRefreshToken = req.cookies.refreshToken;
    let id;

    try {
      id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: 'Unauthorized'
      };
      return next(error);
    }

    try {
      const match = await Refreshtoken.findOne({ _id: id, token: originalRefreshToken });

      if (!match) {
        const error = {
          status: 401,
          message: 'Unauthorized'
        };
        return next(error);
      }

      // Generate new access and refresh tokens
      const accessToken = JWTService.signAccessToken({ _id: id }, '30m');
      const refreshToken = JWTService.signRefreshToken({ _id: id }, '60m');

      // Update the refresh token in the database
      await Refreshtoken.updateOne({ _id: id }, { token: refreshToken });

      // Set new tokens as cookies
      res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httponly: true
      });

      res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httponly: true
      });

      // Find the user and return user details along with auth status
      const user = await User.findOne({ _id: id });
      const userDTO = new UserDTO(user);
      return res.status(200).json({ user: userDTO, auth: true });
    } catch (e) {
      return next(e);
    }
  }
};

module.exports = authcontroller;
