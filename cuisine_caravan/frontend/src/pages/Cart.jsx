import { useCart } from "../store/CartContext";
import Navbar from "../components/Navbar";
import { Link, redirect } from "react-router-dom";
import { ROLES, UBS, isLoggedIn } from "../utils/general";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import React from "react";
const VAT = 0.15;

function calcAmount(cartItem) {
    let count = 0;
    cartItem?.forEach(item=>{
    count = count + item.price * item.quantity 
    })
    return count;
}


function calcVAT(cartItem) {
    let count = 0;
    cartItem?.forEach(item=>{
    count = count + item.price * item.quantity * VAT
    })
    return count;
}
const Cart = () => {
    const cardNumRef = React.useRef(null);
    const cardExpRef = React.useRef(null);
    const cardCVCRef = React.useRef(null);
    const addrRef    = React.useRef(null);
    const { cartItems } = useCart();
    const calcAmountDisp =  calcAmount(cartItems);
    const calcVatDisp =  calcVAT(cartItems);
    const calcTotalDisp =  calcAmountDisp+calcVatDisp;
  const { removeFromCart } = useCart();
  const orderProduct = e => {
    e.preventDefault();
    if(!isLoggedIn()) {
        toast.error("You need to login first");
        return;
    }
    if(parseInt(localStorage.getItem("category")) !== ROLES.CUSTOMER) {
        toast.error("Illegal action");
        return;
    }
    const address = addrRef?.current?.value;
    if(!address) {
        toast.error("Shipping address is needed");
        return;
    }

    // cSubOrder
    fetch(UBS + "cSubOrder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": localStorage.getItem("token")
        },
        body: JSON.stringify({
            products: cartItems, 
            destination: address
        })
    })
    .then(res => {
        if(res.status === 200) {
            return res.json();
        } else if(res.status === 401) {
            toast.error("You are not authorized to perform this action");
            return null;
        } else {
            toast.error("An error occured");
            return null;
        }
    })
    .then(res => {
        if(res === null) return;
        if(res.serverCode === 2000) {
            toast.success("Order placed");
            window.location.href = '/ordersc'
        } else {
            toast.error(res.error);
        }
    })
    .catch(err => {
        console.log(err);
        toast.error("An error occured");
    });
};
  return (
    <>
      <Navbar></Navbar>
      <ToastContainer position="top-center" />
      <div className="mt-5 pt-5">
        <div className="row m-0">
          {cartItems.length ? (
            <>
              <div className="col-lg-12">
                <div className="row">
                  {cartItems.map((cartItem, index) => (
                      <div key={index} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
                        <div className="card mb-4 product-wap rounded-0">
                          <div className="card rounded-0">
                            <div
                              className="card-img rounded-0 img-fluid img-fitting"
                              style={{
                                backgroundImage: `url(${UBS}imgs/${cartItem.previewIMG})`,
                              }}
                            ></div>
                            <div className="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                              <Link
                                className="btn btn-success text-white mt-2"
                                to={`/productor/${cartItem._id}`}
                              >
                                View
                              </Link>
                            </div>
                          </div>
                          <div className="card-body">
                            <a href="/" className="text-decoration-none">
                              {cartItem.name}
                            </a>
                            {cartItem.storefrontName ? (
                              <ul className="w-100 list-unstyled d-flex justify-content-between mb-0">
                                <li>
                                  <Link
                                    to={`/${cartItem.roleLinkS}/${cartItem.storefront}`}
                                    className="h3 text-decoration-none"
                                  >
                                    {cartItem.storefrontName}
                                  </Link>
                                </li>
                              </ul>
                            ) : (
                              ""
                            )}
                            <p className="text-center mb-0 h3">USD {cartItem.price}</p>
                            <div className="text-center pt-2">
                                <span>Quantity: {cartItem.quantity}</span>
                                <span className="text-danger" style={{'float':'right'}} onClick={()=>removeFromCart(cartItem._id)}>
                                    <FontAwesomeIcon icon={faTrash}/>
                                </span>
                                </div>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <Link className="text-decoration-none" to={"/search"}>
                  <button
                type="submit"
                className="btn btn-success btn-md col-2"
                name="cart"
                value="Add to Cart"
                onClick={() => {}}
              >Add More{" "}
              </button>
                </Link>
              </div>                
                <div className="container pb-5 col-6">
                    <h4 className="mb-3">Shipment</h4>
                    <form onSubmit={e => e.preventDefault()} className="mb-3">
                        <div className="form-group">
                            <label htmlFor="shipping">Ship To</label>
                            <input type="text" className="form-control" id="shipping" placeholder="Enter Shipping Address" ref={addrRef} />
                        </div>
                    </form>
                    <h4 className="mb-3">Payment</h4>
                    <h6 className="mb-3">Amount: USD {calcAmountDisp} (+ USD {calcVatDisp} VAT)</h6>
                    <h6 className="mb-3">Total: $ {calcTotalDisp}</h6>
                    <form onSubmit={orderProduct}>
                        <div className="form-group">
                            <label htmlFor="card-number">Card Number</label>
                            <input type="text" className="form-control" id="card-number" placeholder="Enter Card Number" ref={cardNumRef} />
                        </div>
                        <div className="form-group my-4">
                            <label htmlFor="card-exp">Card Expiration</label>
                            <input type="text" className="form-control" id="card-exp" placeholder="Enter Card Expiration" ref={cardExpRef} />
                        </div>
                        <div className="form-group my-4">
                            <label htmlFor="card-cvc">Card CVC</label>
                            <input type="text" className="form-control" id="card-cvc" placeholder="Enter Card CVC" ref={cardCVCRef} />
                        </div>
                        <button type="submit" className="btn btn-dark btn-md my-4" name="submit" value="buy" onClick={() => { }}>Confirm Purchase</button>
                    </form>
                </div>
                
            </>
          ) : (
            <div className="col-12 text-center p-5">
              <i>
                {" "}
                No Items in Cart. <Link to={"/search"}> Go to Menu </Link>
              </i>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
