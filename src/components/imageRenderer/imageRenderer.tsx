import React, { useState } from "react";
// @ts-ignore
import ModalImage from "react-modal-image";
// import "./styles.css";

export interface Slider {
    images: Array<string>
}

const ImageRenderer = ({images}: Slider) => {

    // const expandImage = (image: string) => {
    //     window.open(image, '_blank')?.focus()
    // }
    
    return (
        <>
            {/* {images.map(i => {
                return <img src={i.trim()} style={{maxWidth: '300px', cursor: 'pointer', padding: "10px", objectFit: 'cover'}} onClick={() => expandImage(i.trim())} />
            })} */}
            {images.map((i, key)=> {
                return (
                    <div key={key} style={{maxWidth: '300px', cursor: 'pointer', padding: '10px'}}>
                        <ModalImage
                            hideDownload
                            small={i}
                            large={i}
                        />
                    </div>
                    
                )
            })}
        </>
    )
}

export default ImageRenderer;