import db from "../../lib/mongodb";

const methodsAllowed = ["GET", "POST"];

const handler = async (req, res) => {
  console.log(req);

  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const { email } = req.body.customer;

  if (!email) return res.status(406).json({ message: "Invalid EmailID" });

  const database = await db.getDatabase();
  const users = await database.collection("users");
  const orders = await database.collection("orders");
  const result = await orders.find({ "customer.email": email }).toArray();

  if (result === null)
    return res.status(404).json({ message: "Order(s) Not Found" });

  switch (req.method) {
    case "GET":
      const count = result.length;

      res.json({ orders: result, count });

      break;
    case "POST":
      const { customer, products, payment_method } = req.body;

      const { insertedId: orderid } = await orders.insertOne({
        customer,
        products,
        payment_method,
      });

      const user = await users.findOne({ email });

      if (!user.orders) user.orders = [];
      user.orders.push(String(orderid));

      await users.findOneAndUpdate({ email }, { $set: { ...user } });

      res.status(200).json({ message: "success" });

      break;
  }
};

export default handler;
