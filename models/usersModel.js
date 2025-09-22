const mongoose = require("mongoose");
const validator = require("validator");

// eslint-disable-next-line
const bcrypt = require("bcryptjs");

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    minlength: [2, "Username should be more or atleast 2 characters"],
    maxlength: [35, "Username should be less than or equal 35 characters"],
  },
  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "User should "],
    minlength: [8, "Password should be at least 8 characters long"],
    maxlength: [24, "Password should be less than 24 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // it only works for create() and save() // not on update
      validator: function (el) {
        return el === this.password; // only returns true or false for validation
      },
      message: "Passwords are not the same~!",
    },
  },
  passwordChangedAt: Date,
});

// Encrypting passwords with bcrypt
usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only runs while password is changed
  this.password = await bcrypt.hash(this.password, 10); // values: 8 10 12 16

  // delete passwordConfirm field as it's not necessary to save in database;
  this.passwordConfirm = undefined;
  next();
});

// include an instance method that will be available to all of the documents
usersSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this refers to the current doc. but as password field is select false,
  // hence we can't retrieve the value of this.password. actually we could as we later have select("+password")
  //returns true or false
  return await bcrypt.compare(candidatePassword, userPassword);
};

usersSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      new Date(this.passwordChangedAt).getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);

    return JWTTimestamp < changedTimestamp; // checks if password was changed after the token had already provided
  }
  return false;
};

const User = mongoose.model("User", usersSchema);

module.exports = User;
