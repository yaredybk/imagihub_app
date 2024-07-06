import React from "react";

/**
 * Renders a download button as an anchor element.
 *
 * @param {object} props - Props for the component.
 * @param {Blob} props.imageFile - The image file to be downloaded.
 * @param {React.LinkHTMLAttributes} props - Additional HTML attributes for the anchor element.
 *
 * @returns {React.JSX.Element} The rendered download button component.
 */
export default function BtnDownload({ imageFile ,...props}) {
    return (
        <a id="download_btn" download {...props} title="abc.png" href={imageFile && URL.createObjectURL(imageFile)}>
            download
        </a>
    );
}
