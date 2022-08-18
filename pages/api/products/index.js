import db from "../../../lib/mongodb";

const methodsAllowed = ["GET"];

const handler = async (req, res) => {
  if (!methodsAllowed.includes(req.method))
    return res.status(405).json({ message: "Method Not Allowed" });

  const limit = Number(req.query.limit) || 120;
  const page = Number(req.query.page) || 0;

  const database = db.getDatabase();
  const products = database.collection("products");
  const range = [limit * page + 1, limit * (page + 1)];

  const total = await products.count();
  const result = await products
    .find({})
    .skip(limit * page)
    .limit(limit)
    .toArray();

  res.status(200).json({ result, range, total });
};

export default handler;
