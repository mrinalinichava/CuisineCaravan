import { useState, useRef } from 'react';

export default function SearchBar({ onSearch }) {
    const searchInputRef              = useRef(null);
    const [selProduct, setSelProduct] = useState(true);
    const [byName, setByName]         = useState(true);
    const [asc, setAsc]               = useState(true);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchText  = searchInputRef?.current?.value || null;
        const typeProduct = selProduct;
        const sortByName  = byName;
        const ascending   = asc;
        onSearch && onSearch(searchText, typeProduct, sortByName, ascending);
    };

    return (
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
                        <button className={selProduct  ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setSelProduct(true)}>Product</button>
                        <button className={!selProduct ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setSelProduct(false)}>Storefront</button>
                    </div>
                </div>
                <div className="col-lg-4 stub-margin-20">
                    <p>Sort by</p>
                    <div className="btn-group width100">
                        <button className={byName  ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setByName(true)}>Name</button>
                        <button className={!byName ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setByName(false)}>Price</button>
                    </div>
                </div>
                <div className="col-lg-4 stub-margin-20">
                    <p>Sort order</p>
                    <div className="btn-group width100">
                        <button className={asc  ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setAsc(false)}>Ascending</button>
                        <button className={!asc ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setAsc(true)}>Descending</button>
                    </div>
                </div>
            </div>
        </section>
    );
}