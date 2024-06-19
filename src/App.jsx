import { createPortal } from "react-dom";
import "./App.css";
import { useState } from "react";

function App() {
    const [imageFile, setimageFile] = useState();
    return (
        <>
            {createPortal(
                <a
                    onClick={() => {
                        imageFile && uploadImage(imageFile);
                    }}
                    href="#get-started"
                    type="button"
                    className=" get-started "
                >
                    {imageFile ? "Upload" : "Get started"}
                </a>,
                document.body
            )}
            <h2>Start by uploading your images.</h2>
            <form id="get-started" onSubmit={uploadImage}>
                <div className="image-container shadow-md">
                    <img
                        src={imageFile && URL.createObjectURL(imageFile)}
                        alt="selected image"
                    />
                    <label className=" mt-auto flex gap-1 w-full justify-between bg-sky-300 ">
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
                        <button
                            title="clear selection"
                            type="button"
                            onClick={() => setimageFile()}
                            className="bg-red-400 text-2xl border-none font-extrabold hover:bg-red-600 px-2 p-1"
                        >
                            &#215;
                        </button>
                    </label>
                </div>
            </form>
        </>
    );
}

export default App;

async function uploadImage(imageFile) {
    if (!imageFile) return alert("file not selected!");
    let f = new FormData();
    f.append("image", imageFile);
    fetch("/api/v1/images", {
        body: f,
        method: "POST",
    })
        .then((r) => {
            console.log(r);
        })
        .catch((e) => {
            console.warn(e);
        });
}
