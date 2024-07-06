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

    return (
        <HeroContext.Provider value={{ ...heroBtn, setHeroBtn }}>
            {createPortal(
                <HeroButton
                // title={uploaded?.dir ? `share` : imageFile ? "Upload" : "Get started"}
                />,
                document.body
            )}
            <div id="get-started">
                <MiniHeader />
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



function Receiver() {
    const { dir } = useParams();
    const [imageFile, setimageFile] = useState();
    const [receivedImages, setreceivedImages] = useLocalStorage(
        "received_images",
        {
            init: [],
        }
    );
    const { onClick, setHeroBtn, title } = useContext(HeroContext);
    // const idInputRef = useRef(null);
    useEffect(() => {
        if (dir) getImage(dir);
        else
            setHeroBtn({
                title: "Get started",
                onClick: () => {
                    document.querySelector("#get-started").scrollIntoView();
                    setHeroBtn({
                        title: "Get",
                        onClick: () => {
                            let a = document.querySelector("#get");
                            a ? a.click() : console.log(a);
                        },
                    });
                },
            });
        return () => {};
    }, []);
    function getImage(dir, addToList = true) {
        document.querySelector("#get-started").scrollIntoView();
        setHeroBtn({
            title: "loading ...",
            onClick: () => {
                console.warn("cancel feature not complete");
            },
        });
        fetch(`/api/v1/anon/images/${dir}`)
            .then((r) => (r.ok ? r.blob() : Promise.reject(r)))
            .then((r2) => {
                setimageFile(r2);
                addToList &&
                    (receivedImages.findIndex((i) => i.dir == dir) == -1 ||
                        receivedImages.length == 0) &&
                    setreceivedImages([...receivedImages, { dir, name: dir }]);
                setHeroBtn({
                    title: "share",
                    onClick: () => {
                        shareInfo({
                            title: `imagihub | shared images`,
                            text: dir,
                            url: document.location.origin + "/receive/" + dir,
                        });
                    },
                });
            })
            .catch((e) => {
                setHeroBtn({
                    title: e.statusText || "Failed",
                    onClick: () => {
                        document.querySelector("#image-id")?.focus();
                    },
                });
            });
    }
    return (
        <>
            {imageFile ? (
                <img
                    src={imageFile && URL.createObjectURL(imageFile)}
                    alt="selected image"
                />
            ) : receivedImages?.length ? (
                <RenderHistoryList
                    listImages={receivedImages}
                    title="received images"
                    onClick={(i) => {
                        i.dir && getImage(i.dir, false);
                    }}
                >
                     <ClearHistory
                        onClick={() => {
                            setreceivedImages([])
                        }}
                    />
                </RenderHistoryList>
            ) : (
                <label
                    htmlFor="image"
                    className="grid items-center justify-center text-center  bg-green-300 h-full"
                >
                    <h2>
                        Start by filling the id provided by sender. or get a
                        link
                    </h2>
                </label>
            )}
            <form
                className=" mt-auto flex  "
                onSubmit={(e) => {
                    let { value: id } = e.target[0];
                    console.warn(e);
                    console.warn(id);
                    e.preventDefault();
                    fetch(`/api/v1/anon/image/${id}`)
                        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
                        .then((data) => {
                            let { name, dir } = data;
                            dir && getImage(dir);
                        })
                        .catch((e) => console.warn(e));
                }}
            >
                <label className=" mt-auto flex gap-1 w-full justify-between bg-gray-300 ">
                    {imageFile ? (
                        <i className="  flex items-center px-2">{dir}</i>
                    ) : (
                        <span>
                            <input
                                required
                                // ref={idInputRef}
                                className="m-1"
                                pattern="[0-9a-zA-Z]{4}"
                                type="text"
                                name="image-id"
                                id="image-id"
                                onChange={() => {
                                    setHeroBtn({
                                        title: "Get",
                                        onClick: () => {
                                            let a =
                                                document.querySelector("#get");
                                            a ? a.click() : console.log(a);
                                        },
                                    });
                                }}
                                placeholder="image id"
                            />
                            <button id="get">get</button>
                        </span>
                    )}
                    <button
                        title="clear selection"
                        type="button"
                        onClick={() => {
                            setimageFile();
                            setHeroBtn({
                                title: "Get",
                                onClick: () => {
                                    let a = document.querySelector("#get");
                                    a ? a.click() : console.log(a);
                                },
                            });
                            // document.getElementById("image").value = "";
                        }}
                        className="bg-red-400 text-2xl border-none font-extrabold hover:bg-red-600 px-2 p-1"
                    >
                        &#215;
                    </button>
                </label>
            </form>
        </>
    );
}

function MiniHeader() {
    const { pathname } = useLocation();
    return (
        <div className="grid grid-cols-2  overflow-hidden gap-1">
            <Link
                to="/send#get-started"
                style={{
                    backgroundColor: "/,/send".match(pathname)
                        ? "var(--c1)"
                        : "gray",
                }}
                className="  border-none block text-center font-extrabold text-lg py-1 no-underline font-sans"
            >
                send
            </Link>
            <Link
                to="/receive#get-started"
                style={{
                    backgroundColor: pathname.match("receive")
                        ? "var(--c1)"
                        : "gray",
                }}
                className="  border-none block text-center font-extrabold text-lg py-1 no-underline font-sans"
            >
                receive
            </Link>
        </div>
    );
}
