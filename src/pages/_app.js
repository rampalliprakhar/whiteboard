import { Provider } from "react-redux";
import { store } from "@/store";
import ErrorHandling from "@/components/ErrorHandling";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return(
    <ErrorHandling>
      <Provider store = {store}>
        <Component {...pageProps} />
      </Provider>
    </ErrorHandling>
  );
}