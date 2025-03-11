import React, { useState, useEffect } from "react";

import ReactPlayer from 'react-player';
// import "./styles.css";

export interface Video {
    videos: Array<string>
    videoShouldRandomize: boolean
    updateImageOrder: (url: string) => void
}

const VideoRenderer = ({videos, videoShouldRandomize, updateImageOrder}: Video) => {
    const [sortedVideos, setSortedVideos] = useState<string[]>([])
    useEffect(() => {
        if (sortedVideos.length === videos.length) {
            const sortedIndexes = sortedVideos.map(s => videos.indexOf(s))
            updateImageOrder(sortedIndexes.map(i => i + 1).join(','))
        }
    }, [sortedVideos, videos, updateImageOrder])

    useEffect(() => {
        if (videoShouldRandomize) {
            const forSorting = [...videos]
            const sort = [...forSorting.sort((a, b) => 0.5 - Math.random())]
            setSortedVideos(sort)
        } else {
            setSortedVideos(videos)
        }
    }, [videoShouldRandomize, videos])

    
    return (
        <>
            {sortedVideos.map((v, key)=> {
                return (
                    // @ts-ignore
                    <ReactPlayer key={key} url={v} controls={true} />
                )
            })}
        </>
    )
}

export default VideoRenderer;