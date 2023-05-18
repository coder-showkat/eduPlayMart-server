const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

const run = async () => {
  try {
    const Toys = client.db("EduKit").collection("toys");

    // get all toys
    app.get("/api/toys", async () => {
        try {
          const skip = Number(req.query.page) - 1 || 0;
          const limit = 20;
          const toys = await Toys.find().skip(skip).limit(limit).toArray();
          res.send(toys);
        } catch (error) {
          res.status(500).send({ error: error.message });
        }
      });


  } catch (error) {
    console.log(error);
  }
};

run();

// home route
app.get("/", (req, res) => {
  res.send("<h1 style='text-align: center;'>Welcome to EduKit Server</h1>");
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
