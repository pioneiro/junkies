import db from "../../../lib/mongodb";

const methodsAllowed = ["GET"];

const handler = async (req, res) => {
  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const limit = Number(req.query.limit) || 120;
  const offset = Number(req.query.offset) || 0;

  const database = db.getDatabase();
  const products = database.collection("products");
  const range = [limit * offset + 1, limit * (offset + 1)];

  const total = await products.count();
  const result = await products
    .find({})
    .skip(limit * offset)
    .limit(limit)
    .toArray();

  res.status(200).json({ result, range, total });
};

export default handler;
