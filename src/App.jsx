import { createPortal } from "react-dom";
import "./App.css";
import { useState } from "react";
import {
    Link,
    Route,
    Routes,
    useLocation,
    useSearchParams,
} from "react-router-dom";
import useLocalStorage from "./hooks/useLocalStorage";

function App() {
    const [imageFile, setimageFile] = useState();
    const [uploaded, setUploaded] = useState({ name: "", dir: "" });
    const { id = "", dir = "" } = useSearchParams();
    const [sentImages, setSentImages] = useLocalStorage("sent_images", {
        init: [],
    });
    return (
        <>
            {createPortal(
                <a
                    onClick={() => {
                        if (uploaded?.dir) {
                            shareInfo({
                                title: `imagihub | ${uploaded.name}`,
                                text: uploaded.id,
                                url:
                                    document.location.origin +
                                    "/receive/" +
                                    uploaded.dir,
                            });
                            return;
                        }
                        imageFile &&
                            uploadImage(imageFile)
                                .then((r) => {
                                    console.log(r);
                                    setUploaded(r.new);
                                    setSentImages([...sentImages, r.new]);
                                    setimageFile();
                                })
                                .catch((e) => console.warn(e));
                    }}
                    href="#get-started"
                    type="button"
                    className=" get-started "
                >
                    {uploaded?.dir
                        ? `share`
                        : imageFile
                        ? "Upload"
                        : "Get started"}
                </a>,
                document.body
            )}
            <div id="get-started">
                <MiniHeader />
            <div className="image-container shadow-md">
                <Routes>
                    <Route index path="/send" element={<Sender />} />
                    <Route index path="/receive" element={<Receiver />} />
                    <Route index path="/receive/:dir" element={<Receiver />} />
                    <Route index path="/*" element={<Sender />} />
                </Routes>
</div>
            </div>
        </>
    );
    function Sender() {
        return (
            <>
                {imageFile ? (
                    <img
                        src={imageFile && URL.createObjectURL(imageFile)}
                        alt="selected image"
                    />
                ) : sentImages?.length ? (
                    <div className="grid gap-1 overflow-y-auto p-1">
                        <center>
                            <b>sent images</b>
                        </center>
                        {sentImages?.map((i, ind) => (
                            <button
                                // to={i?.dir}
                                onClick={() => {
                                    setUploaded(i);
                                }}
                                className=" bg-gray-300 p-1 rounded-sm"
                                key={ind + i.name}
                            >
                                {i.name}
                            </button>
                        ))}
                    </div>
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
                        <input
                            className="p-2"
                            onChange={(e) => {
                                setimageFile(e.target.files[0]);
                            }}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            name="image"
                            id="image"
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
                                console.log(
                                    document.location.origin +
                                        "/receive/" +
                                        uploaded.dir
                                );
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
}
export default App;

function Receiver() {
    return (
        <form onSubmit={(e)=>{console.warn(e);e.preventDefault()}}>
            <input type="text" name="id" id="id" placeholder="image id" />
        </form>
    )
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
/**
 * Uploads an image buffer to a server and returns a promise resolving to
 * an object containing information about the uploaded image.
 *
 * @param {Buffer} imageFile The image buffer to upload.
 * @returns {Promise<{message: string, new:{ dir: string, name: string , id: number}}>} A promise resolving to an object with the following properties:
 *   - `dir`: {string} - The directory where the image is uploaded .
 *   - `name`: {string} - The name of the uploaded image file.
 *   - `id`: {number} - The generated id of the uploaded image file.
 */
async function uploadImage(imageFile) {
    if (!imageFile) return alert("file not selected!");
    let f = new FormData();
    console.log(imageFile);
    f.append("image", imageFile);
    return fetch("/api/v1/anon/images", {
        body: f,
        method: "POST",
    })
        .then((r) => {
            console.log({ r });
            if (r.status == 201) return r.json();
            return Promise.reject(r);
        })
        .then(async (r) => {
            console.log(r);
            let { dir, name, id } = r;
            if (process.env.NODE_ENV == "development") {
                console.warn("dev");
                return r;
            }
            return caches
                .open("sent_images")
                .then((c) => c.put(`/api/v1/anon/image/${dir}`, imageFile))
                .then((_) => r);
        })
        .catch((e) => {
            console.warn(e);
            alert(`Error: ${e?.status || "unknown"}\n${e?.statusText || ""}`);
        });
}

function shareInfo(data = { title, text, url }) {
    try {
        navigator.share(data).catch((err) => {
            console.warn(err);
            navigator.clipboard.writeText(data.text);
            alert("unable to share\ntext has been copied to clipboard");
        });
    } catch (err) {
        console.warn(err);
        navigator.clipboard.writeText(data.text);
        alert("unable to share\ntext has been copied to clipboard");
    }
}
