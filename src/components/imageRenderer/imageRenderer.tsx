import React, { useState, useEffect } from "react";
// @ts-ignore
import ModalImage from "react-modal-image";
// import "./styles.css";

export interface Slider {
    images: Array<string>
    shouldRandomize?: boolean
    updateImageOrder: (order: string) => void
}

const ImageRenderer = ({images, shouldRandomize, updateImageOrder}: Slider) => {
    const [sortedImages, setSortedImages] = useState<string[]>([])

    useEffect(() => {
        if (sortedImages.length === images.length) {
            const sortedIndexes = sortedImages.map(s => images.indexOf(s))
            updateImageOrder(sortedIndexes.map(i => i + 1).join(','))
        }
    }, [sortedImages, images, updateImageOrder])

    useEffect(() => {
        if (shouldRandomize) {
            const forSorting = [...images]
            const sort = [...forSorting.sort((a, b) => 0.5 - Math.random())]
            setSortedImages(sort)
        } else {
            setSortedImages(images)
        }
    }, [shouldRandomize, images])

    return (
        <>
            {sortedImages.map((i, key)=> {
                return (
                    <div key={key} style={{maxWidth: '300px', cursor: 'pointer', padding: '10px'}} >
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