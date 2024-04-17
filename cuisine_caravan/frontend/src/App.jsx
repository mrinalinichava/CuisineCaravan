import React from "react";
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import StorefrontVendor from "./pages/StorefrontVendor";
import SearchSpace from "./pages/SearchSpace";
import ProductSpace from "./pages/ProductSpace";
import MyStoresVendor from "./pages/MyStoresVendor";
import MyOrdersSpace from "./pages/MyOrdersSpace";
import StorefrontSpace from "./pages/StorefrontSpace";
import AuthSpace from "./pages/AuthSpace";
import Home from "./pages/Home";
import FourZeroFour from "./pages/FourZeroFour";
import Cart from './pages/Cart';
import { CartProvider } from "./store/CartContext";

function App() {
    return (
        <CartProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/login"         element={<AuthSpace isSignUp={false} yml={false} />} />
                <Route path="/signup"        element={<AuthSpace isSignUp={true}  yml={false} />} />
                <Route path="/flogin"        element={<AuthSpace isSignUp={false} yml={true}  />} />

                <Route path="/search"        element={<SearchSpace />} />

                <Route path="/productvo/:id" element={<ProductSpace viewOnly={true}  editMode={false} />} />
                <Route path="/producted/:id" element={<ProductSpace viewOnly={false} editMode={true}  />} />
                <Route path="/productor/:id" element={<ProductSpace viewOnly={false} editMode={false} />} />

                <Route path="/storerv/:id"   element={<StorefrontSpace showReviewForm={true} showReportForm={true}  />} />
                <Route path="/storenr/:id"   element={<StorefrontSpace showReviewForm={false} showReportForm={false} />} />

                <Route path="/ordersc"       element={<MyOrdersSpace   isCustomer={true}  vacancy={false} />} />
                <Route path="/ordersd"       element={<MyOrdersSpace   isCustomer={false} vacancy={false} />} />
                <Route path="/ordersj"       element={<MyOrdersSpace   isCustomer={false} vacancy={true}  />} />
                <Route path="/cart"       element={<Cart />} />

                <Route path="/mystore/:id"   element={<StorefrontVendor />} />
                <Route path="/mystores"      element={<MyStoresVendor   />} />

                <Route path="*"              element={<FourZeroFour />} />
            </Routes>
        </BrowserRouter>
        </CartProvider>
    );
}

export default App;
