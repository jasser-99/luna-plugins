import { LunaSelectItem, LunaSelectSetting, LunaSettings, LunaSwitchSetting } from "@luna/ui";

import { ReactiveStore } from "@luna/core";

import React from "react";
import { errSignal, restartRotation, trace } from ".";
import { updateActivity } from "./updateActivity";

export const settings = await ReactiveStore.getPluginStorage("DiscordRPC", {
	displayOnPause: true,
	displayArtistIcon: true,
	displayPlaylistButton: true,
	status: 1,

	rotateStatusText: false,
	rotateIntervalSeconds: 20,
});

const applyAndRefresh = () => {
	restartRotation();
	updateActivity()
		.then(() => (errSignal!._ = undefined))
		.catch(trace.err.withContext("Failed to set activity"));
};

export const Settings = () => {
	const [displayOnPause, setDisplayOnPause] = React.useState(settings.displayOnPause);
	const [displayArtistIcon, setDisplayArtistIcon] = React.useState(settings.displayArtistIcon);
	const [displayPlaylistButton, setDisplayPlaylistButton] = React.useState(settings.displayPlaylistButton);
	const [status, setStatus] = React.useState(settings.status);

	const [rotateStatusText, setRotateStatusText] = React.useState(settings.rotateStatusText);
	const [rotateIntervalSeconds, setRotateIntervalSeconds] = React.useState(settings.rotateIntervalSeconds);

	return (
		<LunaSettings>
			<LunaSwitchSetting
				title="Display activity when paused"
				desc="If disabled, when paused discord wont show the activity"
				tooltip="Display activity"
				checked={displayOnPause}
				onChange={(_, checked) => {
					setDisplayOnPause((settings.displayOnPause = checked));
					applyAndRefresh();
				}}
			/>
			<LunaSwitchSetting
				title="Display artist icon"
				desc="Shows the artist icon in the activity"
				tooltip="Display artist icon"
				checked={displayArtistIcon}
				onChange={(_, checked) => {
					setDisplayArtistIcon((settings.displayArtistIcon = checked));
					applyAndRefresh();
				}}
			/>
			<LunaSwitchSetting
				title="Display playlist button"
				desc="When playing a playlist a button appears for it in the activity"
				tooltip="Display playlist button"
				checked={displayPlaylistButton}
				onChange={(_, checked) => {
					setDisplayPlaylistButton((settings.displayPlaylistButton = checked));
					applyAndRefresh();
				}}
			/>

			<LunaSwitchSetting
				title="Auto rotate status text"
				desc="Cycles the Listening to line between track, artist, and TIDAL"
				tooltip="Auto rotation"
				checked={rotateStatusText}
				onChange={(_, checked) => {
					setRotateStatusText((settings.rotateStatusText = checked));
					applyAndRefresh();
				}}
			/>

			<LunaSelectSetting
				title="Rotation interval"
				desc="How often the status text rotates"
				value={rotateIntervalSeconds}
				onChange={(e) => {
					setRotateIntervalSeconds((settings.rotateIntervalSeconds = parseInt(e.target.value)));
					applyAndRefresh();
				}}
			>
				<LunaSelectItem value="10" children="Every 10 seconds" />
				<LunaSelectItem value="20" children="Every 20 seconds" />
				<LunaSelectItem value="30" children="Every 30 seconds" />
				<LunaSelectItem value="60" children="Every 60 seconds" />
			</LunaSelectSetting>

			<LunaSelectSetting
				title="Status text"
				desc="What text that you're 'Listening to' in your Discord status when rotation is off"
				value={status}
				onChange={(e) => {
					setStatus((settings.status = parseInt(e.target.value)));
					applyAndRefresh();
				}}
			>
				<LunaSelectItem value="0" children="Listening to TIDAL" />
				<LunaSelectItem value="1" children="Listening to [Artist Name]" />
				<LunaSelectItem value="2" children="Listening to [Track Name]" />
			</LunaSelectSetting>
		</LunaSettings>
	);
};
