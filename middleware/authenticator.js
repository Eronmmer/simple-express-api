const jwt = require("jsonwebtoken");

const authenticator = (req, res, next) => {
	const token = req.header("Authorization");
	// on the client, "Authorization" must be the key of the header carrying the token

	if (!token) {
		return res.status(401).send("Authorization denied!");
	}
	try {
		const decoded = jwt.verify(token, "my-deepest-secret");
		// make sure this secret is the same string you used to while issuing the token
		req.user = decoded.user;
		next();
		// move on and execute the next code
	} catch (err) {
		console.error(err);
		res.status(401).send("Authorization denied!");
	}
};

module.exports = authenticator;
