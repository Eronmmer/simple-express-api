const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const authenticator = require("../middleware/authenticator");
// our authenticator middleware we created earlier

// create a new account, Public route
router.post("/register",  async (req, res) => {
	try {
		const { name, email, password } = req.body;
		// check if user exists
		let user = await User.findOne({ email })
		if (user) {
			return res.status(400).send("user already exists. Choose another email address!")
		}
		// hash password
		const salt = await bcrypt.genSalt(15);
		const hashedPassword = await bcrypt.hash(password, salt);

		user = new User({
			name,
			email, 
			password: hashedPassword
		});
		// save user to database
		await user.save();
		res.json({ msg: "account successfully created", user: { name: user.name, email: user.email, id: user._id } });
	} catch (err) {
		console.error(err);
		res.status(500).send("Server Error");
	}
});

// login user, Public route
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		let user = await User.findOne({ email })
		if (!user) {
			return res.status(400).send("Incorrect username or password");
			// you don't want attackers to know what's actually going on right? :)
		}
		// verify password match
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(400).send("Incorrect username or password"); 
		}

		// successfully logged in. Now, generate and send token
		const payload = {
			user: {
				id: user.id
			}
		};
		// this payload is the user id information that will be encrypted, stored in the token and decrypted whenever needed.

		jwt.sign(
			payload, "my-deepest-secret",
			{
				expiresIn: "1 day"
				// token expires after 1 day
			},
			(err, token) => {
				if (err) throw err;
				res.json({ token, msg: "Logged in successfully." });
			}
		);
		// if everything goes well, after successful login, a token will be sent to the client
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal server error")
	}
});

// verify logged in user. Private route
router.get("/", authenticator, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(401).send("Not allowed!");
		}
		res.json({ msg: "authenticated", user: { name: user.name, email: user.email}} );
		// show user their details cause they've been authenticated
	} catch (err) {
		console.error(err);
		res.status(500).send("Internal server error");
	}
});

// delete own account. Private route
router.delete("/", authenticator, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);

		if (!user) {
			return res.status(404).send("User doesn't exist");
		}

		if (user.id.toString() !== req.user.id) {
			return res.status(401).send("Not allowed!!");
			// if a user somehow tries to delete the account of another user, send a "not authorized" status
		}

		// find the user id in the collection and delete their document
		await User.findByIdAndDelete(req.user.id);
		res.send("account successfully deleted!");
	} catch (error) {
		console.error("Internal server error");
		res.status(500).send("Internal server error");
	}
});

// with this, we can call and use our auth route anywhere in our application
module.exports = router;
