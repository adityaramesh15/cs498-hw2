const { Datastore } = require("@google-cloud/datastore");
const express = require("express");

const app = express();
const datastore = new Datastore();

app.use(express.json());

app.get("/greeting", (req, res) => {
  res.send("Hello World!");
});

// Instruction: /register 
// "Takes a JSON-formatted POST request with argument 'username'"
app.post("/register", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).send("Username is required");
    }

    // In Datastore, we create a Key. 
    // We use the username as the name/ID to ensure uniqueness (optional but cleaner)
    // Or we can let Datastore generate an ID by passing just the Kind "User".
    // Here we let Datastore generate the ID to allow multiple users with same name (if desired)
    // or you can enforce uniqueness. The prompt implies simple insertion.
    
    const taskKey = datastore.key("User");
    
    const entity = {
      key: taskKey,
      data: {
        username: username
      },
    };

    await datastore.save(entity);
    res.status(200).send(`User ${username} registered.`);

  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).send("Error registering user");
  }
});

// Instruction: /list
// "Responds to GET requests with a JSON-formatted list of usernames"
app.get("/list", async (req, res) => {
  try {
    const query = datastore.createQuery("User");
    const [users] = await datastore.runQuery(query);
    
    // Map the results to just get the 'username' string
    const usernameList = users.map(u => u.username);
    
    res.json({ users: usernameList });
  } catch (error) {
    console.error("Error in /list:", error);
    res.status(500).send("Error listing users");
  }
});

// Instruction: /clear
// "Removes all users from your Firestore database"
app.post("/clear", async (req, res) => {
  try {
    const query = datastore.createQuery("User");
    const [users] = await datastore.runQuery(query);

    // Get the "Key" (ID) for every user found
    const keys = users.map((user) => user[datastore.KEY]);

    if (keys.length > 0) {
      await datastore.delete(keys);
    }
    
    res.status(200).send("All users cleared.");
  } catch (error) {
    console.error("Error in /clear:", error);
    res.status(500).send("Error clearing data");
  }
});

app.listen(8080, "0.0.0.0", () => {
  console.log("Server running on port 8080");
});