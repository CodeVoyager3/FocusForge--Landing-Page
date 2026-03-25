const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/mydb")
  .then(() => console.log("Connected"))
  .catch(err => console.log(err));


  const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  hashedPassword: String,
  isActive: Boolean
});
