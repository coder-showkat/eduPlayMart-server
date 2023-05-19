const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
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
    app.get("/api/toys", async (req, res) => {
      try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const sort = req.query.sort;
        const search = req.query.search || "";
        let toys;
        switch (sort) {
          case "price-ascending": {
            toys = search
              ? await Toys.find({ $text: { $search: search } })
                  .sort({ price: 1 })
                  .skip(skip)
                  .limit(limit)
                  .toArray()
              : await Toys.find()
                  .sort({ price: 1 })
                  .skip(skip)
                  .limit(limit)
                  .toArray();
            break;
          }
          case "price-descending": {
            toys = search
              ? await Toys.find({ $text: { $search: search } })
                  .sort({ price: -1 })
                  .skip(skip)
                  .limit(limit)
                  .toArray()
              : await Toys.find()
                  .sort({ price: -1 })
                  .skip(skip)
                  .limit(limit)
                  .toArray();
            break;
          }
          default: {
            toys = search
              ? await Toys.find({ $text: { $search: search } })
                  .skip(skip)
                  .limit(limit)
                  .toArray()
              : await Toys.find().skip(skip).limit(limit).toArray();
          }
        }

        const total = search
          ? await Toys.countDocuments({ $text: { $search: search } })
          : await Toys.countDocuments();

        res.send({ toys, total });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // get toys by category
    app.get("/api/toys/category/:subCategory", async (req, res) => {
      try {
        const subCategory = req.params.subCategory;
        const toys = await Toys.find({ subCategory }).toArray();
        res.send(toys);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // get toy by id
    app.get("/api/toys/:id", async (req, res) => {
      try {
        const _id = new ObjectId(req.params.id);
        const toy = await Toys.findOne({ _id });
        res.send(toy);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // get related toys by id
    app.get("/api/toys/related-toys/:id", async (req, res) => {
      try {
        const _id = new ObjectId(req.params.id);
        const toy = await Toys.findOne({ _id });
        if (toy) {
          const relatedToys = await Toys.find({
            subCategory: toy.subCategory,
            _id: { $ne: toy._id },
          }).toArray();
          res.send(relatedToys);
        } else {
          res.status(404).send({ error: "No toys found!" });
        }
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
