import React from 'react';
import Navbar from '../components/Navbar';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import { UBS, isLoggedIn, ENDMSG, LOADMSG } from "../utils/general";

import { StoreCard } from '../components/SearchResults';
import StoreEditor from '../components/StoreEditor';

const RES_LIMIT = 16;

export default function MyStoresVendor() {
    const navigate = useNavigate();
    const [results, setResults] = React.useState([]);
    const [noMoreResults, setNoMoreResults] = React.useState(false);

    const [modalOpen, setModalOpen] = React.useState(false);

    const loadStores = () => {
        if(!isLoggedIn()) {
            toast.error("You must be logged in to view orders");
            return;
        }
        const token = localStorage.getItem("token");
        // acquireStorefrontMany
        fetch(UBS + "acquireStorefrontMany", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                search: null,
                sortBy: "name",
                asc: true,
                skip: results.length,
                limit: RES_LIMIT,
                complexKey: "ownerIn",
                complexVal: localStorage.getItem("userID"),
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
                if(sentOrders.length < RES_LIMIT) {
                    setNoMoreResults(true);
                }
                setResults([...results, ...sentOrders]);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("An error occured");
        });
    };

    React.useEffect(() => {
        loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Navbar />
            <ToastContainer position="top-center" />
            <StoreEditor
                isOpen={modalOpen}
                setModalOpen={setModalOpen}
                onSubmitSuccess={newObj => {
                    setModalOpen(false);
                    navigate(`/mystore/${newObj._id}`);
                }}
                sID={null}
                sName={"New Storefront"}
                sDesc={""}
                sTags={[]}
                sAddresses={[]}
                sIconFLID={null}
                sBannerFLID={null}
            />
            <section className="container py-5 stub-margin-92">
                <button className="btn btn-dark my-4" onClick={() => setModalOpen(true)}>New Store</button>
                <div className="row">
                    <div className="col-lg-12">
                        <InfiniteScroll
                            dataLength={results.length}
                            next={loadStores}
                            hasMore={!noMoreResults}
                            loader={LOADMSG}
                            className="row"
                            endMessage={ENDMSG}
                        >
                            {
                                results.map(({ name, rating, _id, iconFLID }, index) => (
                                    <StoreCard
                                        key={index}
                                        name={name}
                                        rating={rating.average}
                                        storefrontID={_id}
                                        iconFLID={iconFLID}
                                        roleLink="mystore"
                                    />
                                ))
                            }
                        </InfiniteScroll>
                    </div>
                </div>
            </section>
        </>
    );
}