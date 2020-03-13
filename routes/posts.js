const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const authenticator = require("../middleware/authenticator");
const router = express.Router();

// create a post. private route
router.post("/", authenticator, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).send("Not allowed!");
		}
		const { postContent } = req.body;
		const post = new Post({
			user: req.user.id,
			postContent
		});
		
		await post.save();
		res.json({ msg: "post successfully created", post })
		// send back success message with post content to the client
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal Server Error");
	}
});

// get a post. Private route
router.get("/:postId", authenticator,  async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (!post) {
			return res.status(404).send("post doesn't exist");
		}

		if (post.user.toString() !== req.user.id) {
			return res.status(401).send("Not allowed!");
			// sorry fella, you can't view the posts of another user :)
		}

		res.json({ post: { user: post.user, postContent: post.postContent, id: post.id, date: post.date}})
	} catch (err) {
		console.error(err);
		if (err.kind === "ObjectId") {
			return res.status(404).send("post doesn't exist"); 
		}
		// this is to ensure our app doesn't break if we use an object id that mongodb doesn't support
		res.status(500).send("Internal Server Error");
	}
});

// edit a post, Private route
router.put("/:postId", authenticator, async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (!post) {
			return res.status(404).send("post doesn't exist");
		}

		if (post.user.toString() !== req.user.id) {
			return res.status(401).send("Not allowed!");
		}

		const { postContent } = req.body;
		post.postContent = postContent;
		await post.save();
		res.json({msg: "post successfully edited", post: { user: post.user, postContent: post.postContent, id: post.id, date: post.date}})
	} catch (err) {
		console.error(err);
		if (err.kind === "ObjectId") {
			return res.status(404).send("post doesn't exist"); 
		}
		res.status(500).send("Internal Server Error");
	}
});

// delete a post, private route
router.delete("/:postId", authenticator, async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (!post) {
			return res.status(404).send("post doesn't exist");
		}

		if (post.user.toString() !== req.user.id) {
			return res.status(401).send("Not allowed!");
		}

		await Post.findByIdAndDelete(req.params.postId);
		res.send("post successfully deleted.")
	} catch (err) {
		console.error(err);
		if (err.kind === "ObjectId") {
			return res.status(404).send("post doesn't exist"); 
		}
		res.status(500).send("Internal Server Error");
	}
});

module.exports = router;
