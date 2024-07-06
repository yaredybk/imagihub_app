import { createPortal } from "react-dom";
import "./App.css";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
    Link,
    Route,
    Routes,
    useLocation,
    useParams,
    useSearchParams,
} from "react-router-dom";
import useLocalStorage from "./hooks/useLocalStorage";
import RenderHistoryList from "./components/RenderHistoryList";
import { shareInfo } from "./utils/utils";
import HeroButton from "./components/HeroButton";
import ClearHistory from "./components/ClearHistory";
import Sender from "./components/Sender";
import BtnDownload from "./components/BtnDownload";
import Receiver from "./components/Reciever";

export const HeroContext = createContext({
    title: "", // title of hero button "Get started" by defualt
    onClick: null, // a function to call on herobutton click
    setHeroBtn: () => {},
});
function App() {
    const [heroBtn, setHeroBtn] = useState({
        title: "",
        onClick: () => {
            document.querySelector("#get-started").scrollIntoView();
        },
    });
    useEffect(() => {
        createPortal(<MiniHeader />, document.body);

        return () => {};
    }, []);
    function toggleMenu() {
        document.getElementById("nav-btn").classList.toggle("expanded");
    }
    return (
        <HeroContext.Provider value={{ ...heroBtn, setHeroBtn }}>
            {createPortal(
                <>
                    <MiniHeader />
                    <a href="/help">help</a>
                    <button className="more" onClick={toggleMenu}>
                        more
                    </button>
                </>,
                document.getElementById("nav-btn")
            )}
            {createPortal(
                <HeroButton
                // title={uploaded?.dir ? `share` : imageFile ? "Upload" : "Get started"}
                />,
                document.body
            )}
            <div id="get-started">
                <div className="mini-header">
                    <MiniHeader />
                </div>
                <div className="image-container shadow-md">
                    <Routes>
                        <Route index path="/send" element={<Sender />} />
                        <Route index path="/receive" element={<Receiver />} />
                        <Route
                            index
                            path="/receive/:dir"
                            element={<Receiver />}
                        />
                        <Route index path="/*" element={<Sender />} />
                    </Routes>
                </div>
            </div>
        </HeroContext.Provider>
    );
}
export default App;

function MiniHeader() {
    const { pathname } = useLocation();
    function toggleMenu() {
        document.getElementById("nav-btn").classList.toggle("expanded");
    }
    return (
        <>
            <Link
                onClick={toggleMenu}
                to="/send#get-started"
                style={{
                    backgroundColor: "/,/send".match(pathname)
                        ? "var(--c1)"
                        : "",
                }}
            >
                send
            </Link>
            <Link
                onClick={toggleMenu}
                to="/receive#get-started"
                style={{
                    backgroundColor: pathname.match("receive")
                        ? "var(--c1)"
                        : "",
                }}
            >
                receive
            </Link>
        </>
        // </div>
    );
}
