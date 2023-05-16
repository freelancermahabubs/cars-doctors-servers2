const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzwsigq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const carsServicesCollection = client
      .db("carsDoctorsDB")
      .collection("carsServices");
    const carsBookingsCollection = client
      .db("carsDoctorsDB")
      .collection("carsServiceBookings");

    app.get("/carsServices", async (req, res) => {
      const cursor = carsServicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/carsServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { _id: 1, price: 1, service_id: 1, title: 1, img: 1 },
      };
      const result = await carsServicesCollection.findOne(query, options);
      res.send(result);
    });

    // bookings

    app.get("/carsServiceBookings", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await carsBookingsCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/carsServiceBookings", async (req, res) => {
      const carsServiceBookings = req.body;
      // console.log(carsServiceBookings);
      const result = await carsBookingsCollection.insertOne(
        carsServiceBookings
      );
      res.send(result);
    });

    app.patch("/carsServiceBookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      console.log(updateBooking);
      const updatedDoc = {
        $set: {
          ...updateBooking,
        },
      };
      const result = await carsBookingsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // delete

    app.delete("/carsServiceBookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsBookingsCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Cars Doctors is Running");
});
app.listen(port, () => {
  console.log(`Cars Doctors Sever is Running On Port ${port}`);
});
