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

export const HeroContext = createContext({
    title: "",
    onClick: null, // a function to call on herobutton click
    setHeroBtn: () => {},
});
function App() {
    const { id = "", dir = "" } = useSearchParams();

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

function Sender() {
    const [imageFile, setimageFile] = useState();
    const [uploaded, setUploaded] = useState({ name: "", dir: "" });
    const [sentImages, setSentImages] = useLocalStorage("sent_images", {
        init: [],
    });
    const { onClick, setHeroBtn, title } = useContext(HeroContext);
    useEffect(() => {
        setHeroBtn({
            title: title && "Choose a file",
            onClick: () => {
                document.querySelector("#get-started").scrollIntoView();
                setHeroBtn({
                    title: "Choose a file",
                    onClick: () => {
                        document.querySelector("#image")?.click();
                    },
                });
            },
        });
        return () => {};
    }, []);
    function upload(imageFile) {
        setHeroBtn({
            title: "uploading ...",
            onClick,
        });
        if (!imageFile) return alert("file not selected!");
        let body = new FormData();
        body.append("image", imageFile);
        fetch("/api/v1/anon/images", {
            body,
            method: "POST",
        })
            .then((r) => {
                if (r.status == 201) return r.json();
                return Promise.reject(r);
            })
            .then(async (r) => {
                setUploaded(r.new);
                sentImages.findIndex((i) => i.dir == r.new.dir) != -1 &&
                    setSentImages([...sentImages, r.new]);
                setimageFile();
                setHeroBtn({
                    title: "share",
                    onClick: () => {
                        shareInfo({
                            title: `imagihub | ${r.new.name}`,
                            text: r.new.id,
                            url:
                                document.location.origin +
                                "/receive/" +
                                r.new.dir,
                        });
                    },
                });
                let { dir, name, id } = r.new;
                if (window.location.protocol !== "https:") {
                    console.warn("dev");
                    return r;
                }
                
                return caches
                    .open("sent_images")
                    .then((c) =>
                        c.put(
                            `/api/v1/anon/images/${dir}`,
                            new Response(imageFile)
                        )
                    )
                    .catch((e) => console.warn(e));
            })
            .catch((e) => {
                console.warn(e);
                // alert(`Error: ${e?.status || "unknown"}\n${e?.statusText || ""}`);
                setHeroBtn({
                    title: e.statusText || "Retry",
                    onClick: () => upload(imageFile),
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
            ) : sentImages?.length ? (
                <RenderHistoryList listImages={sentImages} />
            ) : (
                <label
                    htmlFor="image"
                    className="grid items-center justify-center text-center  bg-green-300 h-full"
                >
                    <h2>Start by uploading your images.</h2>
                </label>
            )}
            <label className=" mt-auto flex gap-1 w-full justify-between bg-gray-300 ">
                {imageFile ? (
                    <i className="  flex items-center px-2">
                        {imageFile?.name}
                    </i>
                ) : (
                    <form
                        id="image-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            // upload();
                        }}
                    >
                        <input
                            className="p-2"
                            onChange={(e) => {
                                setimageFile(e.target.files[0]);
                                setHeroBtn({
                                    title: "upload",
                                    onClick: () => {
                                        upload(e.target.files[0]);
                                    },
                                });
                            }}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            name="image"
                            id="image"
                        />
                    </form>
                )}
                <button
                    title="clear selection"
                    type="button"
                    onClick={() => {
                        setimageFile();
                        // document.getElementById("image").value = "";
                    }}
                    className="bg-red-400 text-2xl border-none font-extrabold hover:bg-red-600 px-2 p-1"
                >
                    &#215;
                </button>
            </label>
            <div
                style={{
                    display: uploaded?.dir ? "flex" : "none",
                }}
                className="absolute  flex-col  justify-start gap-2 left-0 right-0 bottom-0 min-h-[50%] bg-[var(--c2)] p-2"
            >
                <b className="pl-2 header">
                    {uploaded.name}
                    <button
                        title="clear selection"
                        type="button"
                        onClick={() => {
                            setUploaded({
                                dir: "",
                                name: "",
                            });
                            // document.getElementById("image").value = "";
                        }}
                        className="bg-red-400 absolute right-0 top-0 text-2xl border-none font-extrabold hover:bg-red-600 px-2 "
                    >
                        &#215;
                    </button>
                </b>
                <br />
                <div className="flex gap-2 bg-blue-300 p-1 ">
                    <label htmlFor="id" className=" basis-6">
                        id
                    </label>
                    <span className=" basis-30 flex-1">{uploaded.id}</span>
                    <button
                        onClick={() => {
                            shareInfo({
                                title: `imagihub | ${uploaded.name}`,
                                text: uploaded.id,
                                url:
                                    document.location.origin +
                                    "/receive/" +
                                    uploaded.dir,
                            });
                        }}
                    >
                        share
                    </button>
                </div>
                <div className="flex gap-2 bg-blue-300 p-1 ">
                    <label htmlFor="id" className=" basis-6">
                        dir
                    </label>
                    <span className=" basis-30 flex-1">
                        .../receive/{uploaded.dir}
                    </span>
                    <button
                        onClick={() => {
                            shareInfo({
                                title: `imagihub | ${uploaded.name}`,
                                text: uploaded.id,
                                url:
                                    document.location.origin +
                                    "/receive/" +
                                    uploaded.dir,
                            });
                        }}
                    >
                        share
                    </button>
                </div>
            </div>
        </>
    );
}

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
                        title: "Fill image ID",
                        onClick: () => {
                            let a = document.querySelector("#image-id");
                            a ? a.focus() : console.log(a);
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
                    receivedImages.findIndex((i) => i.dir == dir) == -1 &&
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
                />
            ) : (
                <label
                    htmlFor="image"
                    className="grid items-center justify-center text-center  bg-green-300 h-full"
                >
                    <h2>Start by filling the id provided by sender.
                        or get a link
                    </h2>
                </label>
            )}
            <form
                className=" mt-auto flex  "
                onSubmit={(e) => {
                    console.warn(e);
                    e.preventDefault();
                }}
            >
                <label className=" mt-auto flex gap-1 w-full justify-between bg-gray-300 ">
                    {imageFile ? (
                        <i className="  flex items-center px-2">{dir}</i>
                    ) : (
                        <input
                            // ref={idInputRef}
                            className="m-1"
                            pattern="[0-9a-zA-Z]{4}"
                            type="text"
                            name="image-id"
                            id="image-id"
                            placeholder="image id"
                        />
                    )}
                    <button
                        title="clear selection"
                        type="button"
                        onClick={() => {
                            setimageFile();
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
