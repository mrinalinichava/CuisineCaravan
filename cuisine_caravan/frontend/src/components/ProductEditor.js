import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactModal from 'react-modal';
import { UBS, isLoggedIn } from '../utils/general';

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const LIMIT = 8;

export default function ProductEditor({
    isOpen, setModalOpen, onSubmitSuccess, sID,
    pID, pName, pPrice, pDescription,
    pAvailable, pImageFLIDs, pPreviewIMG
}) {
    const formNameRef  = useRef(null);
    const formDescRef  = useRef(null);
    const formPriceRef = useRef(null);
    const [available, setAvailable] = useState(pAvailable);
    const [images, setImages]       = useState([...pImageFLIDs]);
    const [thumb, setThumb]         = useState(pPreviewIMG);

    const [files, setFiles] = useState([]);

    const updateProduct = () => {
        if(!isLoggedIn()) {
            toast.error("You must be logged in to update/create a product");
            return;
        }
        const name  = formNameRef?.current?.value;
        const desc  = formDescRef?.current?.value || "";
        const price = formPriceRef?.current?.value;

        if(!name) { toast.error("Please fill in the name field"); return; }
        if(!price) { toast.error("Please fill in the price field"); return; }

        if(images.length === 0) { toast.error("Please upload at least one image"); return; }

        if(!thumb) { toast.error("Please select a thumbnail"); return; }

        const ep = pID === null ? "addProduct" : "updateProduct";
        let essentials = {
            name: name,
            description: desc,
            price: parseInt(price),
            available: available,
            imageFLIDs: images,
            previewIMG: thumb
        };

        if(pID === null) {
            essentials.storefrontID = sID;
        } else {
            essentials.productID = pID;
        }

        const token = localStorage.getItem("token");

        fetch(UBS + ep, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(essentials)
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
                onSubmitSuccess(res.payload);
            } else {
                toast.error(res.error);
            }
        })
        .catch(err => {
            console.log(err);
            toast.error("Something went wrong");
        });
    };

    return (
        <ReactModal
            isOpen={isOpen}
            contentLabel="Edit Product"
            onRequestClose={() => setModalOpen(false)}
            style={{ content: { marginTop: 80 } }}
        >
            <ToastContainer position="bottom-center" />
            <button onClick={updateProduct} className="btn btn-dark mx-2" style={{ float: 'right', display: 'inline-block' }}>Submit</button>
                <button onClick={() => setModalOpen(false)} className="btn btn-danger mx-2" style={{ float: 'right', display: 'inline-block' }}>Close</button>
            <div className="container py-5">
                <h4>Product Info</h4>
                <form onSubmit={e => e.preventDefault()} className="mb-2">
                    <div className="form-group mb-2">
                        <input type="text" className="form-control" id="productFormName" placeholder="Product name" ref={formNameRef} defaultValue={pName}></input>
                    </div>
                    <div className="form-group row mb-2">
                        <div className="col-lg-4 mb-2">
                            <input type="number" className="form-control" id="productFormPrice" placeholder="Price" ref={formPriceRef} defaultValue={pPrice}></input>
                        </div>
                        <div className="col-lg-4 mb-2">
                            <button
                                type="button"
                                className={available ? "btn btn-dark" : "btn btn-outline-dark"}
                                onClick={() => setAvailable(!available)}
                            >{available ? "Available" : "Not Available"}</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <textarea className="form-control" id="productFormBody" rows="6" placeholder="Product description" ref={formDescRef} defaultValue={pDescription}></textarea>
                    </div>
                </form>
                <div className="py-5">
                    <ul className="list-group">
                        {
                            images.map((image, index) => (
                                <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
                                    Image {index + 1}
                                    {
                                        image !== thumb ? (
                                            <button className="btn btn-dark" onClick={() => setThumb(image)}>Select as thumbnail</button>
                                        ) : (
                                            <button className="btn btn-dark" disabled>Using as thumbnail</button>
                                        )
                                    }
                                    <button className="btn btn-danger" onClick={() => {
                                        const newList = images.filter(img => img !== image);
                                        if (image === thumb) {
                                            if (newList.length > 0) {
                                                setThumb(newList[0]);
                                            } else {
                                                setThumb(null);
                                            }
                                        }
                                        setImages(newList);
                                    }}>Remove</button>
                                    <div style={{ maxWidth: 100 }}>
                                        <img src={`${UBS}imgs/${image}`} alt={`img${index}`} style={{ maxWidth: 100, maxHeight: 100 }} />
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <FilePond
                    files={files}
                    server={`${UBS}photos`}
                    name="image"
                    allowMultiple={true}
                    maxFiles={LIMIT - images.length}
                    onupdatefiles={setFiles}
                    onprocessfile={(error, file) => {
                        if(error) {
                            console.error(error);
                        } else {
                            let flname = null;
                            try { flname = JSON.parse(file?.serverId)?.files[0]?.filename; }
                            catch (e) { console.error(e); }
                            if(images.length < LIMIT) {
                                setImages([...images, flname]);
                            }
                        }
                    }}
                    onprocessfiles={() => setTimeout(() => setFiles([]), 2500)}
                    labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                />
            </div>
        </ReactModal>
    );
}