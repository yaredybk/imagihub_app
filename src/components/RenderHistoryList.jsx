import React from "react";
import ClearHistory from "./ClearHistory";

/**
 * Renders a list of historical images.
 *
 * @param {{ listImages: { dir: string, name: string, id: string }[] }} props An object containing the `listImages` property.
 *   - `props.listImages`: {array} An array of objects representing historical images.
 *     - `props.listImages[].dir`: {string} The directory where the image is stored (if applicable).
 *     - `props.listImages[].name`: {string} The name of the image file.
 *     - `props.listImages[].id`: {string} (optional) A unique identifier for the image.
 * @param {string} title
 * @param {Function} onClick
 * @returns {JSX.Element} The JSX element representing the rendered history list.
 */
export default function RenderHistoryList({
    children,
    listImages = [],
    title = "sent images",
    onClick = () => {},
    onClearHistory = () => {},
}) {
    return (
        <div className="grid gap-1 overflow-y-auto p-1">
            <center>
                <b>{title}</b>
            </center>
            {listImages?.map((i, ind) => (
                <button
                    // to={i?.dir}
                    onClick={() => onClick(i)}
                    className=" text-left border  bg-gray-200 p-1 rounded-sm"
                    key={ind + i.name}
                >
                    {i.name}
                </button>
            ))}
            {children}
            <br />
            <ClearHistory onClick={() => {}} />
        </div>
    );
}
