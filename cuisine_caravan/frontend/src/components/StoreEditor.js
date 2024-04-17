import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactModal from 'react-modal';
import { TagsInput } from "react-tag-input-component";
import { UBS, isLoggedIn } from '../utils/general';

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export default function StoreEditor({
    isOpen, setModalOpen, onSubmitSuccess,
    sID, sName, sDesc, sTags, sAddresses,
    sIconFLID, sBannerFLID
}) {
    const formNameRef               = useRef(null);
    const formDescRef               = useRef(null);
    const [tags, setTags]           = useState([...sTags]);
    const [addresses, setAddresses] = useState([...sAddresses]);
    const [icon, setIcon]           = useState(sIconFLID);
    const [banner, setBanner]       = useState(sBannerFLID);

    const [filesICON, setFilesICON]     = useState([]);
    const [filesBANNER, setFilesBANNER] = useState([]);

    const updateStore = () => {
        if(!isLoggedIn()) {
            toast.error("You must be logged in to update/create a store");
            return;
        }
        const name  = formNameRef?.current?.value;
        const desc  = formDescRef?.current?.value || "";

        if(!name) { toast.error("Please fill in the name field"); return; }
        if(tags.length === 0) { toast.error("Please add at least one tag"); return; }
        if(addresses.length === 0) { toast.error("Please add at least one address"); return; }
        if(!icon) { toast.error("Please upload an icon"); return; }
        if(!banner) { toast.error("Please upload a banner"); return; }

        const ep = sID === null ? "cstore" : "ustore";

        let essentials = {
            name: name,
            description: desc,
            tags: tags,
            iconFLID: icon,
            bannerFLID: banner,
            addresses: addresses
        };

        if(sID !== null) {
            essentials.storefrontID = sID;
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
                contentLabel="Edit Storefront"
                onRequestClose={() => setModalOpen(false)}
                style={{ content: { marginTop: 80 } }}
            >
                <ToastContainer position="bottom-center" />
                <button onClick={updateStore} className="btn btn-dark mx-2" style={{ float: 'right', display: 'inline-block' }}>Submit</button>
                <button onClick={() => setModalOpen(false)} className="btn btn-danger mx-2" style={{ float: 'right', display: 'inline-block' }}>Close</button>
                <div className="container py-5">
                    <h4>Storefront Info</h4>
                    <form onSubmit={e => e.preventDefault()} className="mb-2">
                        <div className="form-group mb-2">
                            <input type="text" className="form-control" id="storeFormName" placeholder="Storefront name" ref={formNameRef} defaultValue={sName}></input>
                        </div>
                        <div className="form-group">
                            <textarea className="form-control" id="storeFormBody" rows="6" placeholder="Storefront description" ref={formDescRef} defaultValue={sDesc}></textarea>
                        </div>
                        
                        <div className="form-group mb-2"></div>
                    </form>
                    <p><h4>Storefront Tags</h4><small>(Press Enter to add)</small></p>
                    <div className="pb-5">
                        <TagsInput
                            value={tags}
                            onChange={setTags}
                            name="tags"
                            placeholder="Add tags"
                        />
                    </div>
                    <p><h4>Storefront Addresses</h4><small>(Press Enter to add)</small></p>
                    <div className="pb-5">
                        <TagsInput
                            value={addresses}
                            onChange={setAddresses}
                            name="addresses"
                            placeholder="Add addresses"
                        />
                    </div>
                    <h4>Store Icon Image (Thumbnail)</h4>
                    <div className="py-5">
                        {
                            icon ? (
                                <img src={`${UBS}imgs/${icon}`} style={{ maxHeight: 128, maxWidth: 128 }} alt="Storefront icon" />
                            ) : ''
                        }
                    </div>
                    {icon && <button className="btn btn-danger w-100" onClick={() => { setIcon(null) }}>Remove Icon</button>}
                    <FilePond
                        files={filesICON}
                        server={`${UBS}photos`}
                        name="image"
                        allowMultiple={true}
                        maxFiles={icon !== null ? 0 : 1}
                        onupdatefiles={setFilesICON}
                        onprocessfile={(error, file) => {
                            if(error) {
                                console.error(error);
                            } else {
                                let flname = null;
                                try { flname = JSON.parse(file?.serverId)?.files[0]?.filename; }
                                catch (e) { console.error(e); }
                                if(icon === null) {
                                    setIcon(flname);
                                }
                            }
                        }}
                        onprocessfiles={() => setTimeout(() => setFilesICON([]), 2500)}
                        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                    />
                    <h4>Banner Image</h4>
                    <div className="py-5">
                        {
                            banner ? (
                                <img src={`${UBS}imgs/${banner}`} style={{ maxHeight: 300, maxWidth: 780 }} alt="Storefront banner" />
                            ) : ''
                        }
                    </div>
                    {banner && <button className="btn btn-danger w-100" onClick={() => { setBanner(null) }}>Remove Banner</button>}
                    <FilePond
                        files={filesBANNER}
                        server={`${UBS}photos`}
                        name="image"
                        allowMultiple={true}
                        maxFiles={banner !== null ? 0 : 1}
                        onupdatefiles={setFilesBANNER}
                        onprocessfile={(error, file) => {
                            if(error) {
                                console.error(error);
                            } else {
                                let flname = null;
                                try { flname = JSON.parse(file?.serverId)?.files[0]?.filename; }
                                catch (e) { console.error(e); }
                                if(banner === null) {
                                    setBanner(flname);
                                }
                            }
                        }}
                        onprocessfiles={() => setTimeout(() => setFilesBANNER([]), 2500)}
                        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                    />
                </div>
            </ReactModal>
    );
}