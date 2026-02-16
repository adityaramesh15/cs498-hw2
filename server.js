const { Datastore } = require("@google-cloud/datastore");
const express = require("express");

const app = express();
const datastore = new Datastore();

app.use(express.json());

app.get("/greeting", (req, res) => {
  res.send("Hello World!");
});


app.post("/register", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).send("Username is required");
    }
    
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


app.get("/list", async (req, res) => {
  try {
    const query = datastore.createQuery("User");
    const [users] = await datastore.runQuery(query);
    
    const usernameList = users.map(u => u.username);
    
    res.json({ users: usernameList });
  } catch (error) {
    console.error("Error in /list:", error);
    res.status(500).send("Error listing users");
  }
});

app.post("/clear", async (req, res) => {
  try {
    const query = datastore.createQuery("User");
    const [users] = await datastore.runQuery(query);

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