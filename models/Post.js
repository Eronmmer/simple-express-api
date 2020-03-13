const mongoose = require("mongoose");

const Post = mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
		// what the above means is each post document will have a user field that contains a user id from the user collection. Think of it like an identifier indicating the author of a post
	},
	postContent: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("post", Post);
