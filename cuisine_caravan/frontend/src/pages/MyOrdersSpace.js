import React from 'react';
import Navbar from '../components/Navbar';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ROLES, UBS, LOADMSG, isLoggedIn } from "../utils/general";
import { OrderCard } from '../components/OrderList';


function customerOrderSorting(type, customerID) {
    const keys = [];
    const vals = [];
    switch(type) {
        case 'all':
            keys.push('customer');
            vals.push(customerID);
        break;

        case 'run':
            keys.push('customer', 'stateNE');
            vals.push(customerID, '255');
        break;

        case 'done':
            keys.push('customer', 'stateEQ');
            vals.push(customerID, '255');
        break;

        default:
            break;
    }
    return { keys, vals };
}

function delivererOrderSorting(type, delivererID) {
    const keys = [];
    const vals = [];
    switch(type) {
        case 'all':
            keys.push('deliverer');
            vals.push(delivererID);
        break;

        case 'run':
            keys.push('deliverer', 'stateNE');
            vals.push(delivererID, '255');
        break;

        case 'done':
            keys.push('deliverer', 'stateEQ');
            vals.push(delivererID, '255');
        break;

        case 'task':
            keys.push('stateEQ');
            vals.push('7');
        break;

        default:
            break;
    }
    return { keys, vals };
}

const buttons = [
    { text: 'All',     value: 'all' },
    { text: 'Running', value: 'run' },
    { text: 'Done',    value: 'done' },
];
const _drops = ['all', 'run', 'done', 'task'];

function generalOrderSorting(type, isCustomer, vacant) {
    const userID = localStorage.getItem("userID");
    if(vacant) {
        return delivererOrderSorting('task', userID);
    }
    return isCustomer ? customerOrderSorting(type, userID) : delivererOrderSorting(type, userID);
}

const ORDER_LOAD_LIMIT = 16;

export default function MyOrdersSpace({ isCustomer, vacancy }) {
    const [results, setResults] = React.useState([]);
    const [noMoreOrders, setNoMoreOrders] = React.useState(false);
    const [searchStarted, setSearchStarted] = React.useState(false);

    const [dropVal, setDropVal] = React.useState(vacancy ? 3 : 0);

    const fetchOrders = append => {
        if(!isLoggedIn()) {
            toast.error("You must be logged in to view orders");
            return;
        }
        const token = localStorage.getItem("token");

        const agterms = generalOrderSorting(_drops[dropVal], isCustomer, vacancy);
        // acquireOrderMany
        fetch(UBS + "acquireOrderMany", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                search: null,
                sortBy: "createdAt",
                asc: false,
                skip: results.length || 0,
                limit: ORDER_LOAD_LIMIT,
                complexKey: agterms.keys,
                complexVal: agterms.vals,
                suppress: []
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
                const sentOrders = res.payload;
                if(append) {
                    setResults([...results, ...sentOrders]);
                } else {
                    setResults(sentOrders);
                }
                if(sentOrders.length < ORDER_LOAD_LIMIT) {
                    setNoMoreOrders(true);
                }
                console.log(results)
                setSearchStarted(true);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
        });
    };

    React.useEffect(() => {
        fetchOrders(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeByID = _id => {
        setResults(results.filter(r => r._id !== _id));
    };

    return (
        <>
            <Navbar />
            <ToastContainer position="top-center" />
            <section className="container py-5 stub-margin-92">
                <div className="my-5">
                    {
                        !vacancy && (
                            <div className="btn-group width100">
                                {
                                    buttons.map((b, i) => (
                                        <div key={i} className={dropVal === i ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => {
                                            setDropVal(i);
                                            setSearchStarted(false);
                                            setNoMoreOrders(false);
                                            fetchOrders(false);
                                        }}>{b.text}</div>
                                    ))
                                }
                            </div>
                        )
                    }
                </div>
                <InfiniteScroll
                    dataLength={results.length}
                    next={() => fetchOrders(true)}
                    hasMore={searchStarted && !noMoreOrders}
                    loader={LOADMSG}
                    endMessage={
                        <p style={{ textAlign: 'center' }} className="my-5">
                            {searchStarted ? <b>You have reached the end</b> : <b>Orders will appear here</b>}
                        </p>
                    }
                >
                    {
                        results.map(({
                            _id, product, productName, quantity, storefrontName, pickupPoint, destination,
                            customerName, delivererName, state, paymentBase, paymentVat, createdAt,productList
                        }, index) => {
                            console.log(product,'098');
                            return <OrderCard
                                productList={productList}
                                key={index}
                                role={ isCustomer ? ROLES.CUSTOMER : ROLES.DELIVERER }
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
                                pickups={null}
                                removeByIDFn={removeByID}
                            />
                        })
                    }
                </InfiniteScroll>
            </section>
        </>
    );
}