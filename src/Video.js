import React, { useRef, useLayoutEffect } from 'react';
import { setVideoElement } from './playback.js';

export default function () {
	const videoRef = useRef();

	useLayoutEffect(() => {
		console.log(videoRef.current);
		if (videoRef.current) {
			setVideoElement(videoRef.current);
		}
	}, [videoRef.current]);

	return (
		<div style={{
			border: '1px solid red'
		}}
		>
			<video
				ref={videoRef}
				poster="https://i.ytimg.com/vi/NpEaa2P7qZI/maxresdefault.jpg"
				style={{
					objectFit: 'cover',
					width: '100%',
					height: '100%'
				}}
			>
				<source src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-webm-file.webm" type="video/webm" />
			</video>
			asdasdsdf
		</div>
	);
}
