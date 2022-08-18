import { useContext, useEffect, useState } from "react";
import { signIn } from "next-auth/react";

import Navbar from "../components/Navbar";
import GlobalContext from "../components/GlobalContext";

const Home = () => {
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState([]);

  const { user, updateUser } = useContext(GlobalContext);

  const fetchProducts = async () => {
    const res = await fetch(`/api/products?page=${page}`);
    const data = await res.json();

    return data;
  };

  const addToCart = async (productid, quantity = 1) => {
    if (!user) return signIn();

    await fetch(`/api/cart?email=${user.email}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ productid, quantity }),
    });

    await updateUser();
  };

  const updateCart = async (productid, diff) => {
    let { cart } = user;

    cart = cart.filter((e) => e.productid === productid)[0];
    cart.quantity += diff;

    await fetch(`/api/cart?email=${user.email}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(cart),
    });

    await updateUser();
  };

  const remove = async (productid) => {
    await fetch(`/api/cart?email=${user.email}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify({ productid }),
    });

    await updateUser();
  };

  const itemQuantity = (productid) =>
    user.cart.filter((e) => e.productid === productid)[0].quantity;

  const setDefaultImage = (e) => {
    e.target.src =
      "https://newhorizon-mechanical-engineering.s3.ap-south-1.amazonaws.com/nhengineering/mechanical-engineering/wp-content/uploads/2020/01/17104603/default-placeholder.png";
  };

  useEffect(() => {
    (async () => {
      const data = await fetchProducts();

      setProducts(data.result);
    })();
  }, []);

  return (
    <>
      <Navbar />

      <main className="px-16 sm:px-24 pb-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl text-center md:text-justify my-8">
          Trending Products
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-16">
          {products.map((e) => (
            <div
              className="px-8 py-4 pb-12 flex flex-col justify-evenly items-center gap-2 rounded-xl overflow-hidden text-center shadow-2xl relative lg:hover:scale-105 transition"
              key={e._id}
            >
              <img
                className="w-full aspect-square object-contain"
                src={JSON.parse(e.image)[0]}
                onError={setDefaultImage}
                alt="productImage"
              />
              <span className="text-xl font-medium">{e.brand}</span>
              <span>{e.product_name}</span>
              <span className="text-2xl font-bold">₹{e.discounted_price}</span>

              {user?.cartItems.includes(e._id) ? (
                <div className="absolute bottom-0 inset-x-0 h-8 flex items-center">
                  <span className="h-full leading-8 grow bg-green-600 text-white">
                    {itemQuantity(e._id)} In Cart
                  </span>
                  <button
                    onClick={updateCart.bind(this, e._id, -1)}
                    className="h-full p-2 bg-orange-600 text-white hover:bg-orange-800 active:bg-orange-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="h-full bi bi-dash-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={updateCart.bind(this, e._id, 1)}
                    className="h-full p-2 bg-blue-600 text-white hover:bg-blue-800 active:bg-blue-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="h-full bi bi-plus-lg"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={remove.bind(this, e._id)}
                    className="h-full p-2 bg-red-600 text-white hover:bg-red-800 active:bg-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      className="h-full bi bi-trash3"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  className="absolute bottom-0 inset-x-0 h-8 bg-green-600 text-white hover:bg-green-800 active:bg-green-500"
                  onClick={() => addToCart(e._id)}
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </section>
      </main>
    </>
  );
};

export default Home;
