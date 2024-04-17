import React from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from '../components/Navbar';
import ProductEditor from '../components/ProductEditor';
import { UBS, ROLES, isLoggedIn } from '../utils/general';
import { useCart } from '../store/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faBackward } from '@fortawesome/free-solid-svg-icons';

const VAT = 0.15;

function calcAmount(price, qty) {
    return Math.round(price * qty);
}

function calcTotal(price, qty) {
    return Math.round(price * qty * (1 + VAT));
}

function calcVAT(price, qty) {
    return Math.round(price * qty * VAT);
}

export default function ProductSpace({ viewOnly, editMode }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    // acquireProductOne

    // id must by a valid mongodb ObjectID, check using regex
    if(!/^[0-9a-fA-F]{24}$/.test(id)) {
        navigate('/404');
    }

    const productID = id;

    const [productObject, setProductObject] = React.useState(null);

    const slideShowRef              = React.useRef(null);
    const [quantity, setQuantity]   = React.useState(1);
    const [modalOpen, setModalOpen] = React.useState(false);

    const cardNumRef = React.useRef(null);
    const cardExpRef = React.useRef(null);
    const cardCVCRef = React.useRef(null);
    const addrRef    = React.useRef(null);
    const { cartItems } = useCart();

    const showCheckout = !viewOnly && !editMode;

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
                product: productID,
                quantity: quantity,
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
            } else {
                toast.error(res.error);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
        });
    };

    const fetchProduct = () => {
        fetch(UBS + "acquireProductOne", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                id: productID,
                suppress: []
            })
        })
        .then(res => {
            if(res.status === 200) {
                return res.json();
            } else {
                toast.error("An error occured");
                return null;
            }
        })
        .then(res => {
            if(res === null) return;
            if(res.serverCode === 2000) {
                setProductObject(res.payload);
            } else {
                navigate('/404');
            }
        })
        .catch(err => {
            console.log(err);
            navigate('/404');
        });
    };

    React.useEffect(() => {
        fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const addToCartCheck = () =>{
        let flag = true;
        cartItems?.forEach(item =>{
            if(item.storefront !== productObject.storefront){
                flag= false;
            }
        })
        if(flag){
            addToCart({...productObject, quantity});
            toast.success("Added to Cart");
        }else{
            toast.error("Cant add from different Store fronts");
        }
    }
     return (
        <>
            <Navbar />
            <ToastContainer position="top-center" />
            <section className="stub-margin-92">
                <Link to="/search" className='mx-3 text-secondary'> <FontAwesomeIcon icon={faArrowCircleLeft} /> Back</Link>
                {
                    productObject ? (
                        <div className="container pb-5">
                            <div className="row">
                                <div className="col-lg-5 mt-5">
                                    <Slide arrows={false} ref={slideShowRef}>
                                        {productObject.imageFLIDs.map((image, index) => (
                                            <div className="each-slide-effect" key={index}>
                                                <div style={{ 'backgroundImage': `url(${UBS}imgs/${image})` }}></div>
                                            </div>
                                        ))}
                                    </Slide>
                                    <div className="btn-group" style={{ width: "100%" }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => slideShowRef?.current?.goBack()}>Back</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => slideShowRef?.current?.goNext()}>Next</button>
                                    </div>
                                </div>
                                <div className="col-lg-7 mt-5">
                                    <div className="card no-border-override">
                                        <div className="card-body">
                                            <h1 className="h2">{productObject.name}</h1>
                                            <p className="h3 py-2">USD {productObject.price}</p>
                                            <ul className="list-inline">
                                                <li className="list-inline-item">
                                                    <h6>By:</h6>
                                                </li>
                                                <li className="list-inline-item">
                                                    <p className="text-muted"><strong>{productObject.storefrontName}</strong></p>
                                                </li>
                                            </ul>

                                            <h6>Description:</h6>
                                            <p>{productObject.description}</p>
                                            <ul className="list-inline">
                                                <li className="list-inline-item">
                                                    <h6>Avaliable :</h6>
                                                </li>
                                                <li className="list-inline-item">
                                                    <p className="text-muted"><strong>{productObject.available ? 'Yes' : 'No'}</strong></p>
                                                </li>
                                            </ul>


                                            {
                                                !(editMode || viewOnly) ? (
                                                    <div className="row">
                                                        <div className="col-auto">
                                                            <ul className="list-inline pb-3">
                                                                <li className="list-inline-item text-right">Quantity</li>
                                                                <li className="list-inline-item"><span className="btn btn-success" id="btn-minus" onClick={() => setQuantity(quantity === 1 ? quantity : quantity - 1)}>-</span></li>
                                                                <li className="list-inline-item"><span className="badge bg-secondary" id="var-value">{quantity}</span></li>
                                                                <li className="list-inline-item"><span className="btn btn-success" id="btn-plus" onClick={() => setQuantity(quantity === 100 ? quantity : quantity + 1)}>+</span></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ) : ''
                                            }

                                            <div className="row pb-3">
                                                <div className="col d-grid">
                                                    {
                                                        viewOnly ? '' : (
                                                            editMode ? (
                                                                <button type="submit" className="btn btn-success btn-lg" name="submit" value="buy" onClick={() => setModalOpen(true)}>Edit</button>
                                                            ) : (
                                                                <>
                                                                {/* <button type="submit" className="btn btn-success btn-lg" name="submit" value="buy" onClick={() => {
                                                                    // scroll to bottom of the page
                                                                    //
                                                                    window.scrollTo(0, document.body.scrollHeight);
                                                                }}>Buy</button> */}
                                                                <button type="submit" className="btn btn-success btn-lg" name="cart" value="Add to Cart" onClick={() => {
                                                                    // scroll to bottom of the page
                                                                    addToCartCheck()
                                                                }}>Add to Cart</button>
                                                                </>
                                                            )
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ProductEditor
                                        isOpen={modalOpen}
                                        setModalOpen={setModalOpen}
                                        onSubmitSuccess={newObj => {
                                            setProductObject(newObj);
                                            setModalOpen(false);
                                            toast.success("Product updated successfully");
                                            // window.location.reload();
                                        }}
                                        sID={productObject.storefront}
                                        pID={productID}
                                        pName={productObject.name}
                                        pPrice={productObject.price}
                                        pDescription={productObject.description}
                                        pAvailable={productObject.available}
                                        pImageFLIDs={productObject.imageFLIDs}
                                        pPreviewIMG={productObject.previewIMG}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center' }}>
                            <h4>Loading Product...</h4>
                        </p>
                    )
                }
                
            </section>
        </>
    );
}