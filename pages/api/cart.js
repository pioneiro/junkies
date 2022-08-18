import db from "../../lib/mongodb";

const methodsAllowed = ["GET", "POST", "PUT", "DELETE"];

const handler = async (req, res) => {
  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const email = req.query.email;

  if (!email) return res.status(406).json({ message: "Invalid EmailID" });

  const database = await db.getDatabase();
  const users = await database.collection("users");
  const result = await users.findOne({ email });

  if (result === null)
    return res.status(404).json({ message: "User Not Found" });

  let { cart = [] } = result;

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
        const { productid, quantity = 1 } = req.body;

        let product = cart.find((e) => e.productid === productid);

        if (!product) cart.push((product = { productid, quantity: 0 }));
        product.quantity += quantity;

        await users.findOneAndUpdate({ email }, { $set: { ...result, cart } });

        res.status(200).json({ message: "success" });
      }
      break;
    case "PUT":
      {
        const { productid, quantity } = req.body;

        const product = cart.find((e) => e.productid === productid);

        product.quantity = quantity;

        cart = cart.filter((e) => e.quantity > 0);

        await users.findOneAndUpdate({ email }, { $set: { ...result, cart } });

        res.status(200).json({ message: "success" });
      }
      break;
    case "DELETE":
      {
        const { productid } = req.body;

        cart = cart.filter((e) => e.productid !== productid);

        await users.findOneAndUpdate({ email }, { $set: { ...result, cart } });

        res.status(200).json({ message: "success" });
      }
      break;
  }
};

export default handler;
