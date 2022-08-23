import db from "../../lib/mongodb";

const methodsAllowed = ["GET", "POST"];

const handler = async (req, res) => {
  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const { email } = req.body.user || req.query;

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
            pipeline: [
              {
                $unwind: { path: "$products" },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "products.uid",
                  foreignField: "uniq_id",
                  as: "products.item",
                },
              },
              {
                $set: { items: { $first: "$products.item" } },
              },
              {
                $set: {
                  "items.buyPrice": "$products.price",
                  "items.quantity": "$products.quantity",
                },
              },
              {
                $group: {
                  _id: "$_id",
                  products: { $push: "$items" },
                  payment: { $first: "$payment" },
                  createdAt: { $first: "$createdAt" },
                },
              },
            ],
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
