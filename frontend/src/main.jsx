import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// 🔥 Redux Toolkit + Persist Setup
import { Provider } from "react-redux";
import { store, persistor } from "./app/store"; // ✅ yaha change
import { PersistGate } from "redux-persist/integration/react"; // ✅ yaha change

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
         {/* <Suspense fallback={<div>Loading...</div>}> */}
        <App />
        {/* </Suspense> */}
      </PersistGate>
    </Provider>
  </StrictMode>
);
