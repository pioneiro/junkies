import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const Global = createContext(null);

const GlobalProvider = ({ children }) => {
  const { data: session } = useSession();

  const [user, setUser] = useState(null);

  const updateUser = async () => {
    if (!session?.user) return setUser(null);

    const res = await fetch(`/api/cart?email=${session.user.email}`);
    const { cart, count: cartQuantity } = await res.json();

    const cartItems = cart.reduce((prev, curr) => [...prev, curr.uniq_id], []);

    setUser({ ...session.user, cart, cartItems, cartQuantity });
  };

  useEffect(() => {
    updateUser();
  }, [session]);

  return (
    <Global.Provider value={{ user, updateUser }}>{children}</Global.Provider>
  );
};

export { Global as default, GlobalProvider };
