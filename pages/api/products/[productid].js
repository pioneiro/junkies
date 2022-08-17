import { ObjectId } from "mongodb";

import db from "../../../lib/mongodb";

const methodsAllowed = ["GET"];

const handler = async (req, res) => {
  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const productid = ObjectId(req.query.productid);

  const database = db.getDatabase();
  const products = database.collection("products");
  const result = await products.findOne(productid);

  res.status(200).json(result);
};

export default handler;
