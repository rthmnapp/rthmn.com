import React from "react";

const YouTubeEmbed = ({ videoUrl }) => {
	const embedUrl = `${videoUrl}?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&controls=0`;
	return (
		<div
			className="relative w-full"
			style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}
		>
			<iframe
				className="absolute top-0 left-0 h-full w-full"
				src={embedUrl}
				title="YouTube video player"
				allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				frameBorder="0"
			/>
		</div>
	);
};

const VideoRefBlock = ({ videoTitle, className, videoUrl }) => {
	if (!videoUrl) {
		return null;
	}

	switch (className) {
		case "light":
			return (
				<div className="mb-6 flex w-full justify-center p-2">
					<div className="flex w-full flex-col items-end rounded-[.7em] bg-neutral-300 p-2 pb-4 shadow-lg lg:w-3/4">
						<span className="mb-2 ml-2 rounded-full bg-[#5eead4] pt-[3px] pr-2 pb-[5px] pl-2 text-[16px]">
							VIDEO
						</span>
						<YouTubeEmbed videoUrl={videoUrl} />
						<p className="ml-2 pt-4 text-center text-2xl leading-[1em] tracking-wide text-black uppercase">
							{videoTitle}
						</p>
					</div>
				</div>
			);
		case "dark":
			return (
				<div className="flex w-full justify-center p-2 py-4">
					<div className="flex w-full flex-col items-start rounded-[.7em] p-2 pb-4 shadow-lg lg:w-2/3">
						<div className="flex w-full flex-wrap items-center justify-between">
							<span className="my-4 ml-2 rounded-full bg-[#5eead4] pt-[3px] pr-2 pb-[5px] pl-2 text-[16px] font-bold">
								VIDEO
							</span>
							<p className="text-md py-2 text-center leading-[1.3em] font-bold tracking-wide text-blue-100 uppercase">
								{videoTitle}
							</p>
						</div>
						<YouTubeEmbed videoUrl={videoUrl} />
					</div>
				</div>
			);
		default:
			return null;
	}
};

export default React.memo(VideoRefBlock);
