import React from 'react';
import Navbar from '../components/Navbar';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ProductCard } from '../components/SearchResults';
import { ReviewCard, ReviewForm, ReportForm, ReportCard } from '../components/ReviewSystem';
import { ROLES, UBS, ENDMSG, isLoggedIn, LOADMSG } from "../utils/general";

const PRODUCT_LOAD_LIMIT = 16;
const REVIEW_LOAD_LIMIT  = 12;

export default function StorefrontSpace({ showReviewForm, showReportForm }) {
    const { id } = useParams();
    const navigate = useNavigate();

    if(!/^[0-9a-fA-F]{24}$/.test(id)) {
        navigate('/404');
    }

    const storefrontID = id;

    const [storeObject, setStoreObject] = React.useState(null);
    const [products, setProducts]       = React.useState([]);
    const [reviews, setReviews]         = React.useState([]);
    const [reports, setReports]         = React.useState([]);

    const [noMoreProducts, setNoMoreProducts] = React.useState(false);
    const [noMoreReviews, setNoMoreReviews]   = React.useState(false);
    const [noMoreReports, setNoMoreReports]   = React.useState(false);

    const [tabIndex, setTabIndex] = React.useState(parseInt(localStorage.getItem("sfs_i")) || 0);

    function updateTabIndex(index) {
        setTabIndex(index);
        localStorage.setItem("sfs_i", index);
    }

    let roleLinkP = "productvo";
    let roleLinkS = "storenr";
    if(isLoggedIn()) {
        const role = parseInt(localStorage.getItem("category"));
        if(role === ROLES.CUSTOMER) {
            roleLinkP = "productor";
            roleLinkS = "storerv";
        }
    }

    const fetchStorefront = () => {
        fetch(UBS + "acquireStorefrontOne", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                id: storefrontID,
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
                setStoreObject(res.payload);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
        });
    };

    const fetchProducts = () => {
        // acquireProductMany
        fetch(UBS + "acquireProductMany", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                search: null,
                sortBy: "name",
                asc: true,
                skip: products.length,
                limit: PRODUCT_LOAD_LIMIT,
                complexKey: "belongsTo",
                complexVal: storefrontID,
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
                const sentProducts = res.payload;
                if(sentProducts.length < PRODUCT_LOAD_LIMIT) {
                    setNoMoreProducts(true);
                }
                setProducts([...products, ...sentProducts]);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
        });
    };

    const fetchReviews = () => {
        // acquireReviewMany
        fetch(UBS + "acquireReviewMany", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                search: null,
                sortBy: "createdAt",
                asc: false,
                skip: reviews.length,
                limit: REVIEW_LOAD_LIMIT,
                complexKey: "storefront",
                complexVal: storefrontID,
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
                const sentReviews = res.payload;
                if(sentReviews.length < REVIEW_LOAD_LIMIT) {
                    setNoMoreReviews(true);
                }
                setReviews([...reviews, ...sentReviews]);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
        });
    };

    const fetchReports = () => {
        // acquireReportMany
        fetch(UBS + "acquireReportMany", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                search: null,
                sortBy: "createdAt",
                asc: false,
                skip: reports.length,
                limit: REVIEW_LOAD_LIMIT,
                complexKey: ["storefront", "customer"],
                complexVal: [storefrontID, localStorage.getItem("userID")],
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
                const sentReports = res.payload;
                if(sentReports.length < REVIEW_LOAD_LIMIT) {
                    setNoMoreReports(true);
                }
                setReports([...reports, ...sentReports]);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
        });
    };

    const submitReview = async (formTitle, formBody, formStars) => {
        if(!isLoggedIn()) {
            toast.error("You must be logged in to submit a review");
            return false;
        }
        if(!formTitle) {
            toast.error("Review title is required");
            return false;
        }
        const token = localStorage.getItem("token");
        // addReview
        return fetch(UBS + "addReview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                storefrontID: storefrontID,
                rating: formStars,
                title: formTitle,
                description: formBody || ""
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
            if(res === null) return false;
            if(res.serverCode === 2000) {
                const newReview = res.payload;
                setReviews([newReview, ...reviews]);
                toast.success("Review submitted");
                return true;
            } else {
                toast.error(res.message);
                return false;
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
            return false;
        });
    };

    const submitReport = async (formTitle, formBody) => {
        if(!isLoggedIn()) {
            toast.error("You must be logged in to submit a report");
            return false;
        }
        if(!formTitle) {
            toast.error("Report title is required");
            return false;
        }
        const token = localStorage.getItem("token");
        // addReport
        return fetch(UBS + "addReport", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                storefrontID: storefrontID,
                title: formTitle,
                description: formBody || ""
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
            if(res === null) return false;
            if(res.serverCode === 2000) {
                const newReport = res.payload;
                setReports([newReport, ...reports]);
                toast.success("Report submitted");
                return true;
            } else {
                toast.error(res.message);
                return false;
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
            return false;
        });
    };


    React.useEffect(() => {
        fetchStorefront();
        fetchProducts();
        fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Navbar />
            <ToastContainer position="top-center" />
            {
                storeObject ? (
                    <section
                            className="py-5 stub-margin-92"
                            style={{
                                background: `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${UBS}imgs/${storeObject.bannerFLID})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center center'
                            }}
                        >
                        <div className="container">
                            <div className="row align-items-center py-5">
                                <div className="col-md-4">
                                    <img src={`${UBS}imgs/${storeObject.iconFLID}`} className="sicon" alt="StoreIcon"></img>
                                </div>
                                <div className="col-md-8 text-white">
                                    <h1>{storeObject.name}</h1>
                                    <p>{storeObject.description}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <span className="stub-margin-92 my-5" style={{ textAlign: 'center' }}>Loading...</span>
                )
            }
            <Tabs selectedIndex={tabIndex} defaultIndex={tabIndex} onSelect={index => updateTabIndex(index)}>
                <TabList style={{ border: 0, backgroundColor: '#d1d1d1', margin: 0 }}>
                    <Tab>Products</Tab>
                    <Tab>Reviews</Tab>
                    {/* <Tab>Report</Tab> */}
                </TabList>
                <TabPanel>
                    <section className="container py-5">
                        <div className="row">
                            <div className="col-lg-12">
                                <InfiniteScroll
                                    dataLength={products.length}
                                    next={fetchProducts}
                                    hasMore={!noMoreProducts}
                                    loader={LOADMSG}
                                    className="row"
                                    endMessage={ENDMSG}
                                >
                                    {
                                        products.map(({ name, price, _id, previewIMG }, index) => (
                                            <ProductCard
                                                key={index}
                                                name={name}
                                                price={price}
                                                storefrontName={null}
                                                storefront={null}
                                                previewIMG={previewIMG}
                                                productID={_id}
                                                roleLinkP={roleLinkP}
                                                roleLinkS={roleLinkS}
                                            />
                                        ))
                                    }
                                </InfiniteScroll>
                            </div>
                        </div>
                    </section>
                </TabPanel>
                <TabPanel>
                    <section className="container py-5">
                        {
                            showReviewForm ? <ReviewForm onSubmit={submitReview} /> : ''
                        }
                        <div className="py-5">
                            <InfiniteScroll
                                dataLength={reviews.length}
                                next={fetchReviews}
                                hasMore={!noMoreReviews}
                                loader={LOADMSG}
                                endMessage={ENDMSG}
                            >
                                {reviews.map(({ title, byName, rating, description }, index) => {
                                    return <ReviewCard
                                        key={index}
                                        title={title}
                                        byName={byName}
                                        rating={rating}
                                        description={description}
                                    />;
                                })}
                            </InfiniteScroll>
                        </div>
                    </section>
                </TabPanel>
                <TabPanel>
                    <section className="container py-5">
                        {
                            showReportForm ? <ReportForm onSubmit={submitReport} /> : ''
                        }
                        <div className="py-5">
                            <InfiniteScroll
                                dataLength={reports.length}
                                next={fetchReports}
                                hasMore={!noMoreReports}
                                loader={LOADMSG}
                                endMessage={ENDMSG}
                            >
                                {reports.map(({ title, byName, description }, index) => {
                                    return <ReportCard
                                        key={index}
                                        title={title}
                                        byName={byName}
                                        description={description}
                                    />;
                                })}
                            </InfiniteScroll>
                        </div>
                    </section>
                </TabPanel>
            </Tabs>
        </>
    );
}