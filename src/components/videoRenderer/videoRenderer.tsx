import React, { useState } from "react";

import ReactPlayer from 'react-player';
// import "./styles.css";

export interface Slider {
    videos: Array<string>
}

const VideoRenderer = ({videos}: Slider) => {
    
    return (
        <>
            {videos.map((v, key)=> {
                return (
                    <ReactPlayer key={key} url={v} controls={true} />
                )
            })}
        </>
    )
}

export default VideoRenderer;