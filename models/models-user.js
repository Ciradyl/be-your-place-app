const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  emailAddress: { type: String, required: true, unique: true }, //speeds up query process
  password: { type: String, required: true, minlength: 8 },
  image: { type: String, required: true },
  places: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); // query email to the db faster

//note: plural model name; contructor function
module.exports = mongoose.model("User", userSchema);
