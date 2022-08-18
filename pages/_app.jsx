import { SessionProvider } from "next-auth/react";

import { GlobalProvider } from "../components/GlobalContext";

import "../styles/globals.css";

const App = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <GlobalProvider>
        <Component {...pageProps} />
      </GlobalProvider>
    </SessionProvider>
  );
};

export default App;
