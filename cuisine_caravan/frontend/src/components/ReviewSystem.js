import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar as starSol } from '@fortawesome/free-solid-svg-icons';
import { faStar as starReg } from '@fortawesome/free-regular-svg-icons';

export function ReviewForm({ onSubmit }) {
    const [stars, setStars] = useState(1);
    const formTitleRef = useRef(null);
    const formBodyRef  = useRef(null);

    const handleSubmit = async e => {
        e.preventDefault();
        const formTitle = formTitleRef?.current?.value;
        const formBody  = formBodyRef?.current?.value;
        const formStars = stars;
         if(onSubmit) {
            const reset = await onSubmit(formTitle, formBody, formStars);

            if(reset) {
                setStars(1);
                if(formTitleRef?.current?.value) {
                    formTitleRef.current.value = '';
                }
                if(formBodyRef?.current?.value) {
                    formBodyRef.current.value = '';
                }
            }
         }
    };

    return (
        <div className="py-3">
            <h4>Submit Your Review</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="text" className="form-control" id="reviewFormTitle" placeholder="Title" ref={formTitleRef}></input>
                </div>
                <div className="form-group mrg-tb-10">
                    <span>Click star to rate: &nbsp;&nbsp;</span>
                    <span>
                        <FontAwesomeIcon icon={0 < stars ? starSol : starReg} onClick={() => setStars(1)} />
                        <FontAwesomeIcon icon={1 < stars ? starSol : starReg} onClick={() => setStars(2)} />
                        <FontAwesomeIcon icon={2 < stars ? starSol : starReg} onClick={() => setStars(3)} />
                        <FontAwesomeIcon icon={3 < stars ? starSol : starReg} onClick={() => setStars(4)} />
                        <FontAwesomeIcon icon={4 < stars ? starSol : starReg} onClick={() => setStars(5)} />
                    </span>
                </div>
                <div className="form-group">
                    <textarea className="form-control" id="reviewFormBody" rows="3" placeholder="Details (optional)" ref={formBodyRef}></textarea>
                </div>
                <div className="form-group mrg-tb-10">
                    <button type="submit" className="btn btn-dark">Submit</button>
                </div>
            </form>
        </div>
    );
}

export function ReportForm({ onSubmit }) {
    const formTitleRef = useRef(null);
    const formBodyRef  = useRef(null);

    const handleSubmit = async e => {
        e.preventDefault();
        const formTitle = formTitleRef?.current?.value;
        const formBody  = formBodyRef?.current?.value;
        if(onSubmit) {
            const reset = await onSubmit(formTitle, formBody);

            if(reset) {
                if(formTitleRef?.current?.value) {
                    formTitleRef.current.value = '';
                }
                if(formBodyRef?.current?.value) {
                    formBodyRef.current.value = '';
                }
            }
        }
    };

    return (
        <div className="py-3">
            <h4>Submit Your Report</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="text" className="form-control" id="reportFormTitle" placeholder="Title" ref={formTitleRef}></input>
                </div>
                <br />
                <div className="form-group">
                    <textarea className="form-control" id="reportFormBody" rows="3" placeholder="Details (optional)" ref={formBodyRef}></textarea>
                </div>
                <div className="form-group mrg-tb-10">
                    <button type="submit" className="btn btn-dark">Submit</button>
                </div>
            </form>
        </div>
    );
}

export function ReviewCard({ title, byName, rating, description }) {
    return (
        <div className="card crd-margin">
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <h6><FontAwesomeIcon icon={faUser} className='mx-2'/>{byName}</h6>
                <p>
                    <FontAwesomeIcon icon={0 < rating ? starSol : starReg} />
                    <FontAwesomeIcon icon={1 < rating ? starSol : starReg} />
                    <FontAwesomeIcon icon={2 < rating ? starSol : starReg} />
                    <FontAwesomeIcon icon={3 < rating ? starSol : starReg} />
                    <FontAwesomeIcon icon={4 < rating ? starSol : starReg} />
                </p>
                <p className="card-text">{description}</p>
            </div>
        </div>
    );
}

export function ReportCard({ title, byName, description }) {
    return (
        <div className="card crd-margin">
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <h6>{byName}</h6>
                <p className="card-text">{description}</p>
            </div>
        </div>
    );
}