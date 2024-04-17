import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as starFull, faStarHalfStroke as starHalf } from '@fortawesome/free-solid-svg-icons';
import { faStar as starEmpty } from '@fortawesome/free-regular-svg-icons';
import { UBS } from '../utils/general';
import { Link } from 'react-router-dom';

function selectStar(rating) {
    const stars = new Array(5).fill(starEmpty);
    const half = Math.floor(rating);
    const remainder = rating - half;
    for(let i = 0; i < half; i++) {
        stars[i] = starFull;
    }
    if(remainder > 0) {
        stars[half] = starHalf;
    }
    return stars;
}

export function ProductCard({ name, price, storefrontName, storefront, productID, previewIMG, roleLinkP, roleLinkS }) {
    return (
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
            <div className="card mb-4 product-wap rounded-0">
                <div className="card rounded-0">
                    <div className="card-img rounded-0 img-fluid img-fitting" style={{ 'backgroundImage': `url(${UBS}imgs/${previewIMG})` }}></div>
                    <div className="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                        <Link className="btn btn-success text-white mt-2" to={`/${roleLinkP}/${productID}`}>View</Link>
                    </div>
                </div>
                <div className="card-body">
                    <a href="/" className="text-decoration-none">{name}</a>
                    {
                        storefrontName ? (
                            <ul className="w-100 list-unstyled d-flex justify-content-between mb-0">
                                <li><Link to={`/${roleLinkS}/${storefront}`} className="h3 text-decoration-none">{storefrontName}</Link></li>
                            </ul>
                        ) : ''
                    }
                    <p className="text-center mb-0 h3">USD {price}</p>
                </div>
            </div>
        </div>
    );
}

export function StoreCard({ name, rating, storefrontID, iconFLID, roleLink }) {
    return (
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
            <div className="card mb-4 product-wap rounded-0">
                <div className="card rounded-0">
                    <div className="card-img rounded-0 img-fluid img-fitting" style={{ 'backgroundImage': `url(${UBS}imgs/${iconFLID})` }}></div>
                    <div className="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">
                        <a className="btn btn-success text-white mt-2" href={`/${roleLink}/${storefrontID}`}>Visit</a>
                    </div>
                </div>
                <div className="card-body">
                    <a href={`/${roleLink}/${storefrontID}`} className="text-decoration-none">{name}</a>
                    <p>
                        {
                            selectStar(rating).map((star, index) => (
                                <FontAwesomeIcon key={index} icon={star} />
                            ))
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}