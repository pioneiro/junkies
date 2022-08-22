import db from "../../lib/mongodb";

const methodsAllowed = ["GET", "POST", "PUT", "DELETE"];

const handler = async (req, res) => {
  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const email = req.query.email;

  if (!email) return res.status(406).json({ message: "Invalid EmailID" });

  const database = db.getDatabase();
  const users = database.collection("users");
  const result = (
    await users
      .aggregate([
        {
          $match: { email },
        },
        {
          $unwind: {
            path: "$cart",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "cart.uid",
            foreignField: "uniq_id",
            as: "items",
          },
        },
        {
          $set: {
            items: { $arrayElemAt: ["$items", 0] },
          },
        },
        {
          $set: { "items.quantity": "$cart.quantity" },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            email: { $first: "$email" },
            image: { $first: "$image" },
            cart: { $push: "$items" },
          },
        },
      ])
      .toArray()
  )[0];

  if (!result) return res.status(404).json({ message: "User Not Found" });

  let { cart = [] } = result;

  cart = cart.filter((e) => Object.keys(e).length);

  switch (req.method) {
    case "GET":
      {
        const count = cart.reduce((previous, current) => {
          return previous + current.quantity;
        }, 0);

        res.json({ cart, count });
      }
      break;
    case "POST":
      {
        const { uid, quantity = 1 } = req.body;

        cart = cart.map((e) => ({ uid: e.uniq_id, quantity: e.quantity }));
        let product = cart.find((e) => e.uid === uid);

        if (!product) cart.push((product = { uid, quantity: 0 }));
        product.quantity += quantity;

        await users.findOneAndUpdate({ email }, { $set: { ...result, cart } });

        res.status(200).json({ message: "success" });
      }
      break;
    case "PUT":
      {
        const { uid, quantity } = req.body;

        cart = cart.map((e) => ({ uid: e.uniq_id, quantity: e.quantity }));
        const product = cart.find((e) => e.uid === uid);

        product.quantity = quantity;

        cart = cart.filter((e) => e.quantity > 0);

        await users.findOneAndUpdate({ email }, { $set: { ...result, cart } });

        res.status(200).json({ message: "success" });
      }
      break;
    case "DELETE":
      {
        const { uid } = req.body;

        cart = cart.map((e) => ({ uid: e.uniq_id, quantity: e.quantity }));
        cart = cart.filter((e) => e.uid !== uid);

        await users.findOneAndUpdate({ email }, { $set: { ...result, cart } });

        res.status(200).json({ message: "success" });
      }
      break;
  }
};

export default handler;
