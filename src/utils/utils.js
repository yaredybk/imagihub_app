/**
 * Attempts to share information using the Web Share API and falls back to copying the text to the clipboard if sharing fails.
 *
 * @param {Object} [data={ title: '', text: '', url: '', image:blob }] An object containing information to share.
 *   - `data.title`: {string} (optional) The title of the information to share.
 *   - `data.text`: {string} The text content to share. This is required if no `url` is provided.
 *   - `data.url`: {string} (optional) A URL to share. This can be used instead of `text`.
 *   - `data.files`: {[blob]} (optional) An array image blob to share. This can be used instead of `text`.
 * @returns {Promise<void>} (undefined) A promise that resolves when the sharing attempt is complete (either successful or with a fallback).
 */
export function shareInfo(data = { title, text, url, files }) {
    try {
        navigator.share(data).catch((err) => {
            console.warn(err);
            if (data.image) navigator.clipboard.write(data.image);
            else navigator.clipboard.writeText(data.text || data.url);
            alert("unable to share\ntext has been copied to clipboard");
        });
    } catch (err) {
        console.warn(err);
        if (data.image) navigator.clipboard.write(data.image);
        else navigator.clipboard.writeText(data.text || url);
        alert("unable to share\ntext has been copied to clipboard");
    }
}
