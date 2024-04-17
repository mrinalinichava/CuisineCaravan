const ROLES = {
    CUSTOMER:      1,
    VENDOR:        2,
    DELIVERER:     3,
    ADMIN:         4,
    UNAUTHORIZED: -1,
};

// ["productvo", "productor", "producted", "productvo"]

Object.freeze(ROLES);

function DropSelect({ options, onChange, defaultValue }) {
    return (
        <select className="form-select" onChange={e => onChange(e.currentTarget?.value)} defaultValue={defaultValue}>
            {options.map((option, index) => <option key={index} value={option.value}>{option.text}</option>)}
        </select>
    );
}

// localStorage.setItem("userID", payload.userID);
// localStorage.setItem("userName", payload.userName);
// localStorage.setItem("email", payload.email);
// localStorage.setItem("category", payload.category);
// localStorage.setItem("token", payload.token);
// localStorage.setItem("firstName", payload.firstName);
// localStorage.setItem("lastName", payload.lastName);

const CHECKLIST = ["userID", "userName", "email", "category", "token", "firstName", "lastName"];

function isLoggedIn() {
    for(let i = 0; i < CHECKLIST.length; i++) {
        if(localStorage.getItem(CHECKLIST[i]) === null) {
            return false;
        }
    }
    return true;
}

function logOut() {
    for(let i = 0; i < CHECKLIST.length; i++) {
        localStorage.removeItem(CHECKLIST[i]);
    }
}

const UBS = "http://localhost:8080/";
// const UBS = "/";

const ENDMSG = (
    <p style={{ textAlign: 'center' }} className="my-5">
        <i>You have reached the end</i>
    </p>
);

const LOADMSG = <h4 style={{ textAlign: 'center' }} className="my-5">Loading...</h4>;

export { ROLES, DropSelect, UBS, isLoggedIn, logOut, ENDMSG, LOADMSG };