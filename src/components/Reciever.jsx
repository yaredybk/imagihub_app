import { useContext, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { HeroContext } from "../App";
import RenderHistoryList from "./RenderHistoryList";
import ClearHistory from "./ClearHistory";
import { shareInfo } from "../utils/utils";
import BtnDownload from "./BtnDownload";
import { useParams } from "react-router-dom";

export default function Receiver() {
    const { dir } = useParams();
    const [imageFile, setimageFile] = useState();
    const [imageInfo, setimageInfo] = useState({});
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
                setimageInfo({ ...imageInfo, dir });
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
                console.log(e.statusText);
                setHeroBtn({
                    title: e.statusText || "Failed",
                    onClick: () => {
                        document.querySelector("#image-id")?.focus();
                    },
                });
            });
    }
    /**
     * get image dir/ full name / using image id
     * @param {import("react").FormEvent} event
     * @param {string} idin image id note: will be used as priority
     */
    function getDir(event, idin) {
        let id = idin || event.target[0].value;
        if (!id) return console.warn("no id");
        setHeroBtn({ title: "Loading...", onClick: () => null });
        fetch(`/api/v1/anon/image/${id}`)
            .then((r) => (r.ok ? r.json() : Promise.reject(r)))
            .then((data) => {
                let { name, dir } = data;
                setimageInfo(data);
                dir && getImage(dir);
            })
            .catch((er) => {
                setHeroBtn({
                    title: er.statusText || "Failed",
                    onClick: () => {
                        getDir(null, id);
                    },
                });

                console.warn(er);
            });
        event && event.preventDefault();
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
                    onClearHistory={() => {
                        setreceivedImages([]);
                    }}
                />
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
            <form className=" mt-auto flex  " onSubmit={getDir}>
                <label className=" mt-auto flex gap-1 w-full justify-between bg-gray-300 ">
                    {imageFile ? (
                        <>
                            <i className="  flex items-center px-2">
                                {dir || imageInfo.name || imageInfo.dir}
                            </i>
                            <BtnDownload
                                imageFile={imageFile}
                                download={imageInfo.name || imageInfo.dir}
                            />
                        </>
                    ) : (
                        <span>
                            <input
                                required
                                autoFocus
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
