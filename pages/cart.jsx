import { useContext, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

import Navbar from "../components/Navbar";
import GlobalContext from "../components/GlobalContext";

const Cart = () => {
  const { user, updateUser } = useContext(GlobalContext);
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") signIn();
  }, [status]);

  const updateCart = async (uid, diff) => {
    const { cart } = user;

    cart = cart.filter((e) => e.uniq_id === uid)[0];

    const body = {
      uid: cart.uniq_id,
      quantity: cart.quantity + diff,
    };

    await fetch(`/api/cart?email=${user.email}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(body),
    });

    await updateUser();
  };

  const remove = async ({ uid, products }) => {
    await fetch(`/api/cart?email=${user.email}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify({ uid, products }),
    });

    await updateUser();
  };

  const placeOrder = async () => {
    if (!confirm("Are you sure you want to place this order?")) return;

    const order = {
      user: {
        name: user.name,
        email: user.email,
      },
      products: user.cart.map((e) => ({
        uid: e.uniq_id,
        quantity: e.quantity,
        price: e.discounted_price,
      })),
      payment: {
        mode: "cod",
      },
    };

    await fetch("/api/orders", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(order),
    });

    await remove({ products: order.products.map((e) => e.uid) });

    await updateUser();
  };

  const itemQuantity = (uid) =>
    user.cart.filter((e) => e.uniq_id === uid)[0].quantity;

  const itemPrice = (uid) => {
    const item = user.cart.filter((e) => e.uniq_id === uid)[0];

    return item.quantity * item.discounted_price;
  };

  const itemRetailPrice = (uid) => {
    const item = user.cart.filter((e) => e.uniq_id === uid)[0];

    return item.quantity * item.retail_price;
  };

  const cartTotal = () =>
    user.cart.reduce((amt, e) => amt + itemPrice(e.uniq_id), 0);

  const setDefaultImage = (e) => {
    e.target.src =
      "https://newhorizon-mechanical-engineering.s3.ap-south-1.amazonaws.com/nhengineering/mechanical-engineering/wp-content/uploads/2020/01/17104603/default-placeholder.png";
  };

  if (!user) return null;

  return (
    <>
      <Navbar />

      <main className="px-16 sm:px-24 pb-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl text-center md:text-justify my-8">
          Cart
        </h1>

        {user.cart.length > 0 ? (
          <>
            <section className="grid grid-cols-1 gap-8">
              {user.cart.map((e) => (
                <div
                  key={e._id}
                  className="flex flex-col md:flex-row gap-8 border p-4"
                >
                  <img
                    src={JSON.parse(e.image)[0]}
                    alt="product image"
                    className="w-full md:w-1/4 aspect-video object-contain"
                    onError={setDefaultImage}
                  />

                  <div className="flex flex-col justify-between gap-2">
                    <p className="text-2xl font-medium">{e.product_name}</p>
                    <p>
                      <span>Price: </span>
                      {Number(e.retail_price) > Number(e.discounted_price) && (
                        <span className="mr-2 line-through">
                          ₹{e.retail_price}
                        </span>
                      )}
                      <span>₹{e.discounted_price}</span>
                    </p>
                    <p>
                      <span>Items in Cart: </span>
                      <span>{itemQuantity(e.uniq_id)}</span>
                    </p>
                    <p>
                      <span>Amount: </span>
                      {Number(e.retail_price) > Number(e.discounted_price) && (
                        <span className="mr-2 line-through">
                          ₹{itemRetailPrice(e.uniq_id)}
                        </span>
                      )}
                      <span>₹{itemPrice(e.uniq_id)}</span>
                    </p>

                    <div>
                      <button
                        className="p-2"
                        onClick={remove.bind(this, { uid: e.uniq_id })}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="h-4 w-4 bi bi-trash3"
                          viewBox="0 0 16 16"
                        >
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                        </svg>
                      </button>
                      <button
                        className="p-2"
                        onClick={updateCart.bind(this, e.uniq_id, -1)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="h-4 w-4 bi bi-dash-lg"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"
                          />
                        </svg>
                      </button>
                      <button
                        className="p-2"
                        onClick={updateCart.bind(this, e.uniq_id, 1)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="h-4 w-4 bi bi-plus-lg"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="flex mt-8 justify-between items-center">
              <p className="text-lg lg:text-2xl">
                <span>Cart Total: </span>
                <span>₹{cartTotal()}</span>
              </p>

              <button
                onClick={placeOrder}
                className="md:text-lg bg-green-600 hover:bg-green-700 active:bg-green-600 text-white px-4 py-2 rounded-full"
              >
                Checkout
              </button>
            </section>
          </>
        ) : (
          <section className="text-center">No items in Cart yet</section>
        )}
      </main>
    </>
  );
};

export default Cart;
