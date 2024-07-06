import { useContext, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { HeroContext } from "../App";
import RenderHistoryList from "./RenderHistoryList";
import ClearHistory from "./ClearHistory";
import { shareInfo } from "../utils/utils";
import BtnDownload from "./BtnDownload";

export default function Sender() {
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
        let n = document.addEventListener("paste", (e) => {
            let con = e.clipboardData;
            console.log(con);
            let files = con.files;
            if (files.length > 0) {
                setSelectedImage(files[0]);
                setUploaded({ name: "", dir: "" });
                document.querySelector("#get-started").scrollIntoView();
            }
        });
        return () => {
            document.removeEventListener("paste", n);
        };
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
                (sentImages.findIndex((i) => i.dir == r.new.dir) == -1 ||
                    sentImages.length == 0) &&
                    setSentImages([...sentImages, r.new]);
                // setimageFile();
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
                if (window.location.protocol !== "https:") return;
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
    function setSelectedImage(image) {
        setimageFile(image);
        setHeroBtn({
            title: "upload",
            onClick: () => {
                upload(image);
            },
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
                <RenderHistoryList
                    onClick={(im) => {
                        setUploaded(im);
                        fetch(`/api/v1/anon/images/${im.dir}`)
                            .then((r) => (r.ok ? r.blob() : Promise.reject(r)))
                            .then((i) => {
                                setimageFile(i);
                            });
                        // setimageFile();
                        setHeroBtn({
                            title: "share",
                            onClick: () => {
                                shareInfo({
                                    title: `imagihub | ${im.name}`,
                                    text: im.id,
                                    url:
                                        document.location.origin +
                                        "/receive/" +
                                        im.dir,
                                });
                            },
                        });
                    }}
                    listImages={sentImages}
                    onClearHistory={() => {
                        setSentImages([]);
                    }}
                />
            ) : (
                <label
                    htmlFor="image"
                    className="grid items-center justify-center text-center  bg-green-300 h-full"
                >
                    <h2>Start by uploading your images. or JUST PAST IT</h2>
                </label>
            )}
            <form
                id="image-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    upload(imageFile);
                    // upload();
                }}
            >
                <label className=" flex gap-1 w-full justify-between bg-gray-300 ">
                    {imageFile ? (
                        <i className=" px-2  flex gap-4 items-center ">
                            {imageFile ? (
                                <>
                                    {imageFile?.name}
                                    {uploaded.dir && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setUploaded({
                                                        ...uploaded,
                                                        preview: true,
                                                    });
                                                }}
                                                type="button"
                                            >
                                                info
                                            </button>
                                            <BtnDownload
                                                imageFile={imageFile}
                                            />
                                        </>
                                    )}
                                </>
                            ) : (
                                <button autoFocus className="">
                                    send
                                </button>
                            )}
                        </i>
                    ) : (
                        <input
                            className="p-2"
                            onChange={(e) => {
                                setSelectedImage(e.target.files[0]);
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
                            setHeroBtn({
                                title: title && "Choose a file",
                                onClick: () => {
                                    document
                                        .querySelector("#get-started")
                                        .scrollIntoView();
                                    setimageFile();
                                    // document.getElementById("image").value = "";
                                },
                            });
                        }}
                        className="bg-red-400 text-2xl border-none font-extrabold hover:bg-red-600 px-2 p-1"
                    >
                        &#215;
                    </button>
                </label>
            </form>
            <div
                style={{
                    display: uploaded?.dir
                        ? uploaded?.preview == false
                            ? "none"
                            : "flex"
                        : "none",
                }}
                className="image-info absolute  flex-col  justify-start gap-2 left-0 right-0 bottom-0 min-h-[50%] bg-[var(--c2)] bg-opacity-50 p-2"
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
                            setimageFile();
                            setHeroBtn({
                                title: "Choose a file",
                                onClick: () => {
                                    document.querySelector("#image")?.click();
                                },
                            });
                        }}
                        className="bg-red-400 absolute right-0 top-0 text-2xl border-none font-extrabold hover:bg-red-600 px-2 "
                    >
                        &#215;
                    </button>
                </b>
                <br />
                <div className="flex gap-2 bg-blue-300 p-1 ">
                    <label htmlFor="id" className=" basis-6">
                        link
                    </label>
                    <span className=" basis-30 flex-1 overflow-hidden ">
                        {window.location.origin}/receive/{uploaded.dir}
                    </span>
                    <button
                        onClick={() => {
                            shareInfo({
                                title: `imagihub | ${uploaded.name}`,
                                // text: uploaded.id,
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
                        id
                    </label>
                    <span className=" basis-30 flex-1">{uploaded.id}</span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(uploaded.id);
                        }}
                    >
                        copy
                    </button>
                </div>
                <div className="flex gap-2 bg-blue-300 p-1 ">
                    <img
                        className="preview"
                        src={imageFile && URL.createObjectURL(imageFile)}
                        alt="preview"
                    />
                    <span className=" basis-30 flex-1">Share as a file</span>

                    <button
                        onClick={() => {
                            setUploaded({ ...uploaded, preview: false });
                        }}
                    >
                        preview
                    </button>
                    <button
                        onClick={() => {
                            console.log(imageFile);
                            const file = new File([imageFile], uploaded.name, {
                                type: imageFile.type,
                            });
                            shareInfo({
                                title: `imagihub | ${uploaded.name}`,
                                text: uploaded.id,
                                // url:
                                //     document.location.origin +
                                //     "/receive/" +
                                //     uploaded.dir,
                                files: [file],
                            });
                        }}
                    >
                        share
                    </button>
                </div>
                <p className="p-1 rounded-sm bg-red-300 text-red-800">
                    To optimize performance, images are deleted after 2 hours.
                    Stay tuned for future updates on extended storage!
                </p>
            </div>
        </>
    );
}
