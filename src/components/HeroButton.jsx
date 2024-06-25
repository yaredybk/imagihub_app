import { HeroContext } from "../App";
import "./herobtn.css";
import React, { useContext } from "react";

export default function HeroButton({ title, ...props }) {
    const { setHeroBtn, onClick, title: t } = useContext(HeroContext);
    return (
        <a
            id="hero-btn"
            href="#get-started"
            className=" get-started "
            onClick={() => {
                if (onClick) return onClick(title || t);
                console.log("from here");
                document.querySelector("#get-started").scrollIntoView();
                
            }}
            {...props}
        >
            {title || t || "Get started"}
        </a>
    );
}
