import Navbar from "../components/Navbar";
import { UBS } from "../utils/general";

export default function Home() {
    return (
        <>
            <Navbar />
            <section
                className="stub-margin-92"
                style={{
                    background: `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${UBS}photos/unsplash.jpg)`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    paddingTop: '200px',
                    paddingBottom: '200px'
                }}
            >
                <div style={{ paddingLeft: '20%', textAlign: 'right' }}>
                    <div className="row align-items-center py-5">
                        <div className="col-md-8 text-white">
                            <h1>Homemade, Fresh</h1>
                            <p>Ordering is now easier than before</p>
                        </div>
                    </div>
                </div>
            </section>
            <section
                style={{
                    background: `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${UBS}photos/food1.jpg)`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    paddingTop: '200px',
                    paddingBottom: '200px'
                }}
            >
                <div style={{ paddingLeft: '20%' }}>
                    <div className="row align-items-center py-5">
                        <div className="col-md-8 text-white">
                            <h1>Easy Searching</h1>
                            <p>Browse for your favourite food with simplicity</p>
                        </div>
                    </div>
                </div>
            </section>
            <section
                style={{
                    background: `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${UBS}photos/food2.jpg)`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    paddingTop: '200px',
                    paddingBottom: '200px'
                }}
            >
                <div style={{ paddingLeft: '20%', textAlign: 'right' }}>
                    <div className="row align-items-center py-5">
                        <div className="col-md-8 text-white">
                            <h1>One-step Ordering</h1>
                            <p>Buy instantly, with home delivery and order tracking</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}