import { Tracer, type LunaUnload } from "@luna/core";
import { MediaItem, redux } from "@luna/lib";

import { cleanupRPC } from "./discord.native";
import { settings } from "./Settings";
import { setStatusDisplayTypeOverride, updateActivity } from "./updateActivity";

export const unloads = new Set<LunaUnload>();
export const { trace, errSignal } = Tracer("[DiscordRPC]");
export { Settings } from "./Settings";

const ROTATION_ORDER = [2, 1, 0] as const; // Track, Artist, TIDAL
let rotationTimer: ReturnType<typeof setInterval> | undefined;
let rotationIndex = 0;

const safeUpdate = (mediaItem?: MediaItem) =>
	updateActivity(mediaItem)
		.then(() => (errSignal!._ = undefined))
		.catch(trace.err.withContext("Failed to set activity"));

const stopRotation = () => {
	if (rotationTimer) clearInterval(rotationTimer);
	rotationTimer = undefined;
	setStatusDisplayTypeOverride(undefined);
};

export const restartRotation = () => {
	stopRotation();
	rotationIndex = 0;

	if (!settings.rotateStatusText) return;

	const intervalSeconds = Number(settings.rotateIntervalSeconds ?? 20);
	const intervalMs = Math.max(2000, intervalSeconds * 1000);

	setStatusDisplayTypeOverride(ROTATION_ORDER[rotationIndex]);
	safeUpdate();

	rotationTimer = setInterval(() => {
		rotationIndex = (rotationIndex + 1) % ROTATION_ORDER.length;
		setStatusDisplayTypeOverride(ROTATION_ORDER[rotationIndex]);
		safeUpdate();
	}, intervalMs);
};

redux.intercept(
	["playbackControls/TIME_UPDATE", "playbackControls/SEEK", "playbackControls/SET_PLAYBACK_STATE"],
	unloads,
	() => {
		safeUpdate();
	}
);

unloads.add(
	MediaItem.onMediaTransition(unloads, (mediaItem) => {
		if (settings.rotateStatusText) {
			rotationIndex = 0;
			setStatusDisplayTypeOverride(ROTATION_ORDER[rotationIndex]);
		}
		return safeUpdate(mediaItem);
	})
);

unloads.add(stopRotation);
unloads.add(cleanupRPC.bind(cleanupRPC));

setTimeout(() => {
	restartRotation();
	safeUpdate();
});
