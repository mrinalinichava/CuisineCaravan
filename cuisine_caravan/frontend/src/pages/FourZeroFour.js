import Navbar from "../components/Navbar";

export default function FourZeroFour() {
    return (
        <>
            <Navbar />
            <section
                style={{
                    backgroundColor: '#050505',
                    paddingTop: '200px',
                    paddingBottom: '200px'
                }}
            >
                <div style={{ paddingLeft: '25%', textAlign: 'center' }}>
                    <div className="row align-items-center py-5">
                        <div className="col-md-8 text-white">
                            <h1 style={{ fontSize: '120px' }}>404</h1>
                            <p>Looks like what you were trying to find isn't available</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}