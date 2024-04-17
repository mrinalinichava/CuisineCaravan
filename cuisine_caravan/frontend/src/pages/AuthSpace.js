/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UBS } from '../utils/general';

const CAT_CUSTOMER   = 1;
const CAT_VENDOR     = 2;
const CAT_DELIVERER  = 3;

export default function AuthSpace({ isSignUp, yml }) {
    const [signup, setSignup] = React.useState(isSignUp);
    const navigate = useNavigate();

    const fnameRef = React.useRef();
    const lnameRef = React.useRef();
    const unameRef = React.useRef();
    const emailRef = React.useRef();
    const passRef  = React.useRef();
    const [category, setCategory] = React.useState(CAT_CUSTOMER);

    const handleSubmit = e => {
        e.preventDefault();
        const fname = fnameRef?.current?.value;
        const lname = lnameRef?.current?.value;
        const uname = unameRef?.current?.value;
        const email = emailRef?.current?.value;
        const pass  = passRef?.current?.value;

        const reg = signup;

        let missing = false;
        
        if(reg) {
            !fname && (missing = true);
            !lname && (missing = true);
            !email && (missing = true);
        }
        !uname && (missing = true);
        !pass  && (missing = true);

        if(missing) {
            toast.error("Please fill in all the fields");
            return;
        }

        if(reg) {
            fetch(UBS + "register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    firstName: fname,
                    lastName:  lname,
                    userName:  uname,
                    email:     email,
                    password:  pass,
                    category:  category
                })
            })
            .then(res => res.json())
            .then(res => {
                if(res.serverCode === 2000) {
                    const userID = res.payload?.userID;
                    if(userID) {
                        toast.success("Account created successfully");
                        setSignup(false);
                        setTimeout(() => { navigate("/login"); }, 1000);
                    } else {
                        toast.error("Error creating account");
                    }
                } else {
                    toast.error(res.message);
                }
            })
            .catch(err => {
                toast.error("Error creating account");
                console.log(err);
            });
        } else {
            fetch(UBS + "signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    userName: uname,
                    password: pass
                })
            })
            .then(res => res.json())
            .then(res => {
                if(res.serverCode === 2000) {
                    const payload = res.payload;
                    if(payload) {
                        toast.success("Login successful");

                        localStorage.setItem("userID",    payload.userID);
                        localStorage.setItem("userName",  payload.userName);
                        localStorage.setItem("email",     payload.email);
                        localStorage.setItem("category",  payload.category);
                        localStorage.setItem("token",     payload.token);
                        localStorage.setItem("firstName", payload.firstName);
                        localStorage.setItem("lastName",  payload.lastName);

                        setTimeout(() => { navigate("/"); }, 1000);
                    } else {
                        toast.error("Error logging in");
                    }
                } else {
                    toast.error(res.message);
                }
            })
            .catch(err => {
                toast.error("Error logging in");
                console.log(err);
            });
        }
    };

    const reset = () => {
        fnameRef?.current?.value && (fnameRef.current.value = '');
        lnameRef?.current?.value && (lnameRef.current.value = '');
        unameRef?.current?.value && (unameRef.current.value = '');
        emailRef?.current?.value && (emailRef.current.value = '');
        passRef?.current?.value  && (passRef.current.value  = '');
    };

    return (
        <>
            <Navbar navLinks={["Home", "About", "Shop"]} />
            <div className="stub-margin-92" style={{ backgroundColor: '#71de94' }}>
                <section className="container py-5">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card shadow">
                                <div className="card-body">
                                    <h5 className="card-title text-center">{yml ? 'You must be logged in' : (signup ? 'Signup' : 'Login')}</h5>
                                    <form onSubmit={handleSubmit}>
                                        {
                                            signup ? (
                                                <>
                                                    <div className="form-group my-3">
                                                        <label htmlFor="inputFname">First Name</label>
                                                        <input type="text" className="form-control" id="inputFname" placeholder="First Name" ref={fnameRef} />
                                                    </div>
                                                    <div className="form-group my-3">
                                                        <label htmlFor="inputLname">Last Name</label>
                                                        <input type="text" className="form-control" id="inputLname" placeholder="Last Name" ref={lnameRef} />
                                                    </div>
                                                    <div className="form-group my-3">
                                                        <label htmlFor="inputEmail">Email</label>
                                                        <input type="email" className="form-control" id="inputEmail" placeholder="Email" ref={emailRef} />
                                                    </div>
                                                </>
                                            ) : ''
                                        }
                                        <div className="form-group my-3">
                                            <label htmlFor="inputUname">Username</label>
                                            <input type="text" className="form-control" id="inputUname" placeholder="Username" ref={unameRef} />
                                        </div>
                                        <div className="form-group my-3">
                                            <label htmlFor="inputPassword">Password</label>
                                            <input type="password" className="form-control" id="inputPassword" placeholder="Password" ref={passRef} />
                                        </div>
                                        {
                                            signup ? (
                                                <div className="btn-group width100">
                                                    <button type="button" className={category === CAT_CUSTOMER ?  "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setCategory(CAT_CUSTOMER)}>Customer</button>
                                                    <button type="button" className={category === CAT_VENDOR ?    "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setCategory(CAT_VENDOR)}>Vendor</button>
                                                    <button type="button" className={category === CAT_DELIVERER ? "btn btn-dark" : "btn btn-outline-dark"} onClick={() => setCategory(CAT_DELIVERER)}>Deliverer</button>
                                                </div>
                                            ) : ''
                                        }
                                        <button type="submit" className="btn btn-dark my-3">{signup ? 'Signup' : 'Login'}</button>
                                        <a href="#" className="my-3" style={{ textDecoration: 'none', float: 'right', color: '#59ab6e' }} onClick={e => {
                                            e.preventDefault();
                                            reset();
                                            setSignup(!signup);
                                        }}>
                                            {signup ? 'Have an account? Login instead' : 'Don\'t have an account? Signup!'}
                                        </a>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <ToastContainer position="top-center" />
            </div>
        </>
    );
}