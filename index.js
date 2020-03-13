const express = require("express");
const mongoose = require("mongoose");
const app = express();

// connect to mongodb via mongoose
(async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/express-api", {
			// if you don't add the following, mongoose will log annoying warnings to the console
      useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
    });
    console.log("MongoDB Connected!!");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

// initialize middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
	res.send("Welcome to my API!");
});

app.use("/auth", require("./routes/auth"));
// add this above or below where you did the same thing for auth
app.use("/posts", require("./routes/posts"));


// This will ensure your app runs correctly on the specified port
// make sure this is always at the bottom of your file
app.listen(5000, () => {
  console.log("Server started on port 5000");
})
