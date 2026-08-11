const { MongoClient } = require("mongodb");

let client;
let clientPromise;

async function getClient() {
  if (!clientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

module.exports = async (req, res) => {
  try {
    const client = await getClient();

    const db = client.db("exam");
    const collection = db.collection("examPrep");

    if (req.method === "GET") {
      const state = await collection.findOne({ _id: "main" });

      return res.status(200).json(
        state || {
          tasks: {},
          notes: {},
          pomodoroSessions: {},
          electiveChoice: "cgm"
        }
      );
    }

    if (req.method === "PUT") {
      await collection.updateOne(
        { _id: "main" },
        {
          $set: {
            ...req.body,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({
        success: true
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Database error"
    });
  }
};
