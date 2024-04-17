/* eslint-disable jsx-a11y/anchor-is-valid */
// load font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { isLoggedIn, logOut } from '../utils/general';
import { useNavigate } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Link } from 'react-router-dom';

const logoutConfirm = navigate => {
    confirmAlert({
        title: 'Logout',
        message: 'Are you sure to logout?',
        buttons: [
            {
                label: 'Yes',
                onClick: () => {
                    logOut();
                    navigate("/");
                }
            },
            {
                label: 'No',
                onClick: () => {}
            }
        ]
    });
};

const LINKS_AN = [
    { name: 'Home',    link: '/' },
    { name: "Search",  link: "/search" },
    { name: "Login",   link: "/login"  },
    { name: "Sign Up", link: "/signup" },
];

const LINKS_CS = [
    { name: 'Home',    link: '/' },
    { name: "Search",  link: "/search"  },
    { name: "Orders",  link: "/ordersc" },
    { name: "Cart",  link: "/cart" },
];

const LINKS_VN = [
    { name: 'Home',      link: '/' },
    { name: "My Stores", link: "/mystores" },
];

const LINKS_DL = [
    { name: 'Home',        link: '/' },
    { name: "Search",      link: "/search"  },
    { name: "Orders",      link: "/ordersd" },
    { name: "Task Finder", link: "/ordersj" },
];

const CATG = [LINKS_AN, LINKS_CS, LINKS_VN, LINKS_DL];

export default function Navbar() {
    let catg = 0;
    if(isLoggedIn()) {
        catg = parseInt(localStorage.getItem("category"));
    }

    const navLinks = CATG[catg];

    const navigate = useNavigate();
    
    return (
        <nav className="navbar navbar-expand-lg navbar-light fixed-top glassy">
            <div className="container d-flex justify-content-between align-items-center">

                <a className="navbar-brand text-success logo h1 align-self-center" style={{ fontFamily: '"Freestyle Script Regular", sans-serif' }} href="/">Cuisine Caravan</a>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#templatemo_main_nav" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="align-self-center collapse navbar-collapse flex-fill d-lg-flex justify-content-lg-between" id="templatemo_main_nav">
                    <div className="flex-fill">
                        <ul className="nav navbar-nav d-flex justify-content-between mx-lg-auto">
                            {navLinks.map((link, index) => (
                                <li className="nav-item" key={index}>
                                    <Link className="nav-link" to={link.link}>{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {
                        isLoggedIn() && (
                            <div className="navbar align-self-center d-flex">
                                <a className="nav-icon position-relative text-decoration-none" onClick={e => {
                                    e.preventDefault();
                                    logoutConfirm(navigate);
                                }}>
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                </a>
                            </div>
                        )
                    }
                </div>
            </div>
        </nav>
    );
}