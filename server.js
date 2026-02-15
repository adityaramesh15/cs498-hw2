const express = require("express");
const { Firestore } = require("@google-cloud/firestore");
const app = express();
const firestore = new Firestore(); 

app.use(express.json());

app.get("/greeting", (req, res) => {
	 res.send("Hello World!");
});

app.post("/register", async(req, res) => {
	try {
		const { username } = req.body;
		if (!username) {
			return res.status(400).send("Username is required");
		}



	}

}); 



// 0.0.0.0 is critical for GCP to expose it externally
app.listen(8080, "0.0.0.0", () => {
  	 console.log("Server running on port 8080");
});




