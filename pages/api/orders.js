import db from "../../lib/mongodb";

const methodsAllowed = ["GET", "POST"];

const handler = async (req, res) => {
  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const { email } = req.body.user;

  if (!email) return res.status(406).json({ message: "Invalid EmailID" });

  const database = db.getDatabase();
  const users = database.collection("users");
  const orders = database.collection("orders");
  const result = (
    await users
      .aggregate([
        {
          $match: { email },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orders",
            foreignField: "_id",
            as: "orders",
            pipeline: [{ $project: { user: 0 } }],
          },
        },
        {
          $set: { orderCount: { $size: "$orders" } },
        },
        {
          $project: {
            name: true,
            email: true,
            orders: true,
            orderCount: true,
          },
        },
      ])
      .toArray()
  )[0];

  if (!result)
    return res.status(404).json({ message: "No Orders Found for the Email!" });

  switch (req.method) {
    case "GET":
      {
        res.json(result);
      }
      break;
    case "POST":
      {
        const { user, products, payment } = req.body;

        const { insertedId: orderid } = await orders.insertOne({
          user,
          products,
          payment,
          createdAt: Date.now(),
        });

        await users.findOneAndUpdate({ email }, { $push: { orders: orderid } });

        res.status(200).json({ message: "success" });
      }
      break;
  }
};

export default handler;
