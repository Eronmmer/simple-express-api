const mongoose = require("mongoose");

const User = mongoose.Schema({
	name: String,
	email: {
		type: String,
		required: true,
		unique: true
		// email field must be a string, is required and must be unique
	},
	password: {
		type: String,
		required: true,
	}
});

module.exports = mongoose.model("user", User);
// documents located in our "user" collection will follow the schema defined above
