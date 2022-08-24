import { Fragment, useContext, useEffect, useState } from "react";
import { signIn } from "next-auth/react";

import Navbar from "../components/Navbar";
import GlobalContext from "../components/GlobalContext";

const Cart = () => {
  const [orders, setOrders] = useState([]);
  const { status, user } = useContext(GlobalContext);

  const getOrders = async () => {
    if (!user) return;

    const res = await fetch(`/api/orders?email=${user.email}`);
    const { orders } = await res.json();

    orders.sort((a, b) => b.createdAt - a.createdAt);

    setOrders(orders);
  };

  const setDefaultImage = (e) => {
    e.target.src = "/assets/defaultProfile.png";
    e.target.classList.remove("object-contain");
    e.target.classList.add("object-cover");
  };

  useEffect(() => {
    if (status === "authenticated") getOrders();
    if (status === "unauthenticated") signIn();
  }, [status, user]);

  if (!user) return null;

  return (
    <>
      <Navbar />

      <main className="px-4 sm:px-12 md:px-24 pb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl my-8 flex justify-between items-center gap-4">
          <span>Profile</span>
          <img
            className="w-12 sm:w-16 aspect-square border-2 rounded-full text-xs"
            src={user.image}
            alt="profile image"
            onError={setDefaultImage}
            referrerPolicy="no-referrer"
          />
        </h1>

        <section className="grid grid-cols-4 relative px-4 md:px-8 lg:px-16 text-lg sm:text-xl md:text-2xl">
          <span>Name :</span>
          <span className="col-span-3">{user.name}</span>
          {/* <input className="bg-transparent" value={user.name} type="text" disabled /> */}

          <span>Email :</span>
          <span className="col-span-3">{user.email}</span>
        </section>

        <section className="mt-8 px-4 md:px-8 lg:px-16">
          <h2 className="text-lg sm:text-xl md:text-2xl">Orders</h2>

          {orders.length > 0 ? (
            <div className="flex flex-col gap-4 text-sm sm:text-base md:text-lg">
              {orders.map((order) => (
                <div
                  className="flex flex-col gap-4 p-4 rounded-xl shadow-xl"
                  key={order._id}
                >
                  <div className="flex flex-wrap justify-between gap-x-6 text-xs md:text-sm text-gray-400">
                    <p>
                      <span>Order ID: </span>
                      <span>{order._id}</span>
                    </p>

                    <p>
                      <span>Order Date: </span>
                      <span>
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-y-1 text-right">
                    <p className="col-span-3 text-left font-medium">
                      Product Name
                    </p>
                    <p className="font-medium">Price</p>
                    <p className="font-medium">Quantity</p>
                    <p className="font-medium">Amount</p>

                    {order.products.map((product) => (
                      <Fragment key={product._id}>
                        <p className="col-span-3 text-left">
                          {product.product_name}
                        </p>
                        <p>₹{product.buyPrice}</p>
                        <p>x{product.quantity}</p>
                        <p>₹{product.buyPrice * product.quantity}</p>
                      </Fragment>
                    ))}

                    <p className="col-start-2 col-end-3 md:col-start-5 md:col-end-6 font-medium">
                      Total:{" "}
                    </p>
                    <p className="col-start-3 col-end-4 md:col-start-6 md:col-end-7 font-medium">
                      ₹
                      {order.products.reduce(
                        (amt, e) => amt + e.buyPrice * e.quantity,
                        0
                      )}
                    </p>
                  </div>

                  <p>
                    <span>Payment Mode: </span>
                    <span>{order.payment.mode.toUpperCase()}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center text-base sm:text-lg md:text-xl">
              {"You've not placed any order yet!"}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Cart;
