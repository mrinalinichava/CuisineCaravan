import React from 'react';
import Navbar from '../components/Navbar';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ProductCard, StoreCard } from '../components/SearchResults';
// import SearchBar from '../components/SearchBar';
import { UBS, ROLES, isLoggedIn, LOADMSG } from "../utils/general";

const RES_LIMIT = 16;

export default function SearchSpace() {
    const [results, setResults] = React.useState([]);

    const searchInputRef              = React.useRef(null);
    const [selProduct, setSelProduct] = React.useState(true);
    const [byName, setByName]         = React.useState(true);
    const [asc, setAsc]               = React.useState(true);

    const [searchStarted, setSearchStarted] = React.useState(false);
    const [noMoreResults, setNoMoreResults] = React.useState(false);

    let roleLinkP = "productvo";
    let roleLinkS = "storenr";

    React.useEffect(()=>{
        performSearch(false);
    },[selProduct])


    if(isLoggedIn()) {
        const role = parseInt(localStorage.getItem("category"));
        if(role === ROLES.CUSTOMER) {
            roleLinkP = "productor";
            roleLinkS = "storerv";
        }
    }

    const performSearch = (append) => {
        const searchText  = searchInputRef?.current?.value || null;
        const typeProduct = selProduct;
        const sortByName  = byName;
        const ascending   = asc;

        const ep = typeProduct ? "acquireProductMany" : "acquireStorefrontMany";
        const by = sortByName  ? "name" : (selProduct ? "price" : "rating.average");
        
        fetch(UBS + ep, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                search: searchText,
                sortBy: by,
                asc: ascending,
                skip: append ? results.length : 0,
                limit: RES_LIMIT,
                complexKey: [],
                complexVal: [],
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
                const rList = res.payload;
                if(append) {
                    setResults([...results, ...rList]);
                } else {
                    setResults(rList);
                }
                if(rList.length < RES_LIMIT) {
                    setNoMoreResults(true);
                }
                setSearchStarted(true);
            }
        })
        .catch(err => {
            console.log(err);
        });
    };

    const handleSearch = e => {
        e.preventDefault();
        performSearch(false);
    };

    const loadMoreResults = () => {
        performSearch(true);
    };

    return (
        <>
            <Navbar />
            <ToastContainer position="top-center" />
            <section className="container py-5 stub-margin-92">
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <form onSubmit={handleSearch}>
                            <input type="text" className="form-control" id="searchTerm" placeholder="Search" ref={searchInputRef}></input>
                        </form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-4 stub-margin-20">
                        <p>Type</p>
                        <div className="btn-group width100">
                            <button className={selProduct ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => {
                                setResults([]);
                                setSearchStarted(false);
                                setNoMoreResults(false);
                                setSelProduct(true);
                                (searchInputRef?.current?.value) && (searchInputRef.current.value = "");
                                // setTimeout(()=>{performSearch(false)},1000)
                                // performSearch(false);
                            }}>Product</button>
                            <button className={!selProduct ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => {
                                setResults([]);
                                setSearchStarted(false);
                                setNoMoreResults(false);
                                setSelProduct(false);
                                (searchInputRef?.current?.value) && (searchInputRef.current.value = "");
                                // setTimeout(()=>{performSearch(false)},1000)
                            }}>Storefront</button>
                        </div>
                    </div>
                    <div className="col-lg-4 stub-margin-20">
                        <p>Sort by</p>
                        <div className="btn-group width100">
                            <button className={byName ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => {
                                setByName(true);
                                setSearchStarted(false);
                                setNoMoreResults(false);
                                performSearch(false);
                            }}>Name</button>
                            <button className={!byName ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => {
                                setByName(false);
                                setSearchStarted(false);
                                setNoMoreResults(false);
                                performSearch(false);
                            }}>{selProduct ? "Price" : "Rating"}</button>
                        </div>
                    </div>
                    <div className="col-lg-4 stub-margin-20">
                        <p>Sort order</p>
                        <div className="btn-group width100">
                            <button className={asc ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => {
                                setAsc(true);
                                setSearchStarted(false);
                                setNoMoreResults(false);
                                performSearch(false);
                            }}>Ascending</button>
                            <button className={!asc ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => {
                                setAsc(false);
                                setSearchStarted(false);
                                setNoMoreResults(false);
                                performSearch(false);
                            }}>Descending</button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="container py-5">
                <div className="row">
                    <div className="col-lg-12">
                        <InfiniteScroll
                            dataLength={results.length}
                            next={loadMoreResults}
                            hasMore={searchStarted && !noMoreResults}
                            loader={LOADMSG}
                            className="row"
                            endMessage={
                                <p style={{ textAlign: 'center' }} className="my-5">
                                    { searchStarted ? <b>You have reached the end</b> : <b>Search for something</b> }
                                </p>
                            }
                        >
                            {
                                selProduct ? (
                                    results.map(({ name, price, storefrontName, storefront, _id, previewIMG }, index) => (
                                        <ProductCard
                                            key={index}
                                            name={name}
                                            price={price}
                                            storefrontName={storefrontName}
                                            storefront={storefront}
                                            previewIMG={previewIMG}
                                            productID={_id}
                                            roleLinkP={roleLinkP}
                                            roleLinkS={roleLinkS}
                                        />
                                    ))
                                ) : (
                                    results.map(({ name, rating, _id, iconFLID }, index) => (
                                        <StoreCard
                                            key={index}
                                            name={name}
                                            rating={rating?.average}
                                            storefrontID={_id}
                                            iconFLID={iconFLID}
                                            roleLink={roleLinkS}
                                        />
                                    ))
                                )
                            }
                        </InfiniteScroll>
                    </div>
                </div>
            </section>
        </>
    );
}