import React from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ROLES, UBS, isLoggedIn } from "../utils/general";

const OS_CUSTOMER_ORDERED     = 1 << 0;
const OS_VENDOR_ACCEPTED      = 1 << 1;
const OS_VENDOR_PRODUCT_DONE  = 1 << 2;
const OS_DELIVERER_ACCEPT_JOB = 1 << 3;
const OS_VENDOR_HANDOVER      = 1 << 4;
const OS_DELIVERER_RECEIVE    = 1 << 5;
const OS_DELIVERER_HANDOVER   = 1 << 6;
const OS_CUSTOMER_RECEIVE     = 1 << 7;

function updateOrder(order, path, stateFn, pickupPoint, onCancel) {
    if(path === 'vProductIsReady' && !pickupPoint) {
        toast.error('You must select a pickup point');
        return;
    }
    if(!isLoggedIn()) {
        toast.error("You are not logged in");
        return;
    }
    const body = { order };
    if(path === 'vProductIsReady') {
        body.pickupPoint = pickupPoint;
    }
    fetch(UBS + path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(body)
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
            if(res.payload === 0) {
                onCancel && onCancel(order);
            } else {
                stateFn && stateFn(res.payload);
            }
        } else {
            toast.error(res.error);
        }
    })
    .catch(err => {
        console.log(err);
        toast.error("An error occured");
    });
}

export function OrderCard({
    role, product, productName, quantity, storefrontName, pickupPoint, destination,
    customerName, delivererName, state, paymentBase, paymentVat, orderTime, orderID,
    pickups, removeByIDFn,productList
}) {
    console.log(productList,'9876789')
    const [_state, _setState] = React.useState(state);
    const buttons = [];
    const badges = [];
    const sites = [];

    const pickUpRef = React.useRef(null);

    switch (role) {
        case ROLES.CUSTOMER:
            storefrontName && badges.push(['Ordered from', storefrontName]);
            destination && badges.push(['Destination', destination]);
            delivererName && badges.push(['Deliveryperson', delivererName]);
            badges.push(['Payment', `${Math.round(paymentBase + paymentVat)} USD`]);

            if (_state === OS_CUSTOMER_ORDERED)
                buttons.push(['Cancel Order',   () => {
                    updateOrder(orderID, 'cCancelOrder', null, null, removeByIDFn)
                }]);
            if (!(_state & OS_CUSTOMER_RECEIVE) && (_state > OS_DELIVERER_ACCEPT_JOB))
                buttons.push(['I\'ve Received', () => {
                    updateOrder(orderID, 'cReceive', _setState, null, null);
                }]);
            break;
        case ROLES.VENDOR:
            pickupPoint && badges.push(['Pickup point', pickupPoint]);
            destination && badges.push(['Destination', destination]);
            customerName && badges.push(['Customer', customerName]);
            badges.push(['Payment', `${Math.round(paymentBase + paymentVat)} USD`]);

            if (!(_state & OS_VENDOR_ACCEPTED))
                buttons.push(['Accept Order', () => {
                    updateOrder(orderID, 'vAcceptOrder', _setState, null, null);
                }]);
            if (!(_state & OS_VENDOR_PRODUCT_DONE)) {
                buttons.push(['Order Prepared', () => {
                    updateOrder(orderID, 'vProductIsReady', _setState, (pickUpRef?.current?.value || null), null);
                }]);
                if(pickups !== null) {
                    sites.push(...pickups);
                }
            }
            if (!(_state & OS_VENDOR_HANDOVER) && (_state & OS_VENDOR_PRODUCT_DONE) && (_state & OS_VENDOR_ACCEPTED) && (_state & OS_DELIVERER_ACCEPT_JOB))
                buttons.push(['Handover Done', () => {
                    updateOrder(orderID, 'vHandover', _setState, null, null);
                }]);
            break;
        case ROLES.DELIVERER:
            storefrontName && badges.push(['Ordered from', storefrontName]);
            pickupPoint && badges.push(['Pickup point', pickupPoint]);
            destination && badges.push(['Destination', destination]);
            customerName && badges.push(['Customer', customerName]);

            if (!(_state & OS_DELIVERER_ACCEPT_JOB) && (_state & OS_VENDOR_PRODUCT_DONE))
                buttons.push(['Accept Job',       () => {
                    updateOrder(orderID, 'dAcceptDeliveryJob', _setState, null, null);
                }]);
            if (!(_state & OS_DELIVERER_RECEIVE) && (_state & OS_DELIVERER_ACCEPT_JOB) && (_state & OS_VENDOR_PRODUCT_DONE))
                buttons.push(['Received Product', () => {
                    updateOrder(orderID, 'dReceive', _setState, null, null);
                }]);
            if (!(_state & OS_DELIVERER_HANDOVER) && (_state & OS_DELIVERER_RECEIVE) && (_state & OS_DELIVERER_ACCEPT_JOB) && (_state & OS_VENDOR_PRODUCT_DONE))
                buttons.push(['Delivery Done',    () => {
                    updateOrder(orderID, 'dHandover', _setState, null, null);
                }]);
            break;
        default:
            break;
    };

    return (
        <div className="card mb-2">
            <div className="card-header">
                <a className="text-decoration-none text-secondary"> {new Date(orderTime).toLocaleString("en-US")} 
                <span className="fw-bold" style={{float:'right'}}>Order ID {orderID}</span></a>
            </div>
            {
                productList?.map((item)=>{
                    return <li className="mx-3 my-1">{item.productName} (x{item.quantity})  </li>
                })
            }
            <div className="card-body">
                {
                    badges.map(([label, value], index) => (
                        <span key={index} className="badge badge-primary ts-badge">{label}: {value}</span>
                    ))
                }
                <ul className="time-step-ul">
                    <li className={_state & OS_VENDOR_ACCEPTED      ? "ts-f" : "ts-n"}><span>Order accepted</span></li>
                    <li className={_state & OS_VENDOR_PRODUCT_DONE  ? "ts-f" : "ts-n"}><span>Product is ready</span></li>
                    <li className={_state & OS_DELIVERER_ACCEPT_JOB ? "ts-f" : "ts-n"}><span>Deliveryperson has accepted shipment task</span></li>
                    <li className={_state & OS_VENDOR_HANDOVER      ? "ts-f" : "ts-n"}><span>Vendor has handed over</span></li>
                    <li className={_state & OS_DELIVERER_RECEIVE    ? "ts-f" : "ts-n"}><span>Deliveryperson has received the product</span></li>
                    <li className={_state & OS_DELIVERER_HANDOVER   ? "ts-f" : "ts-n"}><span>Deliveryperson has delivered the product</span></li>
                    <li className={_state & OS_CUSTOMER_RECEIVE     ? "ts-f" : "ts-n"}><span>Customer has received the product</span></li>
                </ul>
                {
                    sites.length > 0 && (
                        <>
                            <span>Pickup Point: </span>
                            <select className="form-select mb-2" ref={pickUpRef}>
                                {
                                    sites.map((site, index) => (
                                        <option key={index} value={site}>{site}</option>
                                    ))
                                }
                            </select>
                        </>
                    )
                }
                {
                    buttons.map(([label, onClick], index) => (
                        <button key={index} className="btn btn-primary bg-dark border-0 fl-right ml-2" onClick={onClick}>{label}</button>
                    ))
                }
            </div>
        </div>
    );
}

export function OrderList({ role, orders }) {
    console.log(orders,'orders')
    return (
        <section className="container py-5 stub-margin-92">
            {
                orders.map(({ _id, product, productName, quantity, storefrontName, pickupPoint, destination, customerName, delivererName, state, paymentBase, paymentVat, createdAt }, index) => {
                    return <OrderCard
                        key={index}
                        role={role}
                        product={product}
                        productName={productName}
                        quantity={quantity}
                        storefrontName={storefrontName}
                        pickupPoint={pickupPoint}
                        destination={destination}
                        customerName={customerName}
                        delivererName={delivererName}
                        state={state}
                        paymentBase={paymentBase}
                        paymentVat={paymentVat}
                        orderTime={createdAt}
                        orderID={_id}
                    />
                })
            }
        </section>
    );
}