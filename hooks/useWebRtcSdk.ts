import { GenesysCloudWebrtcSdk, IExtendedMediaSession, ISdkConfig, ISdkConversationUpdateEvent, ISessionIdAndConversationId, SessionTypes } from "genesys-cloud-webrtc-sdk";
import { v4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { removePendingSession, storeHandledPendingSession, updateConversations, updatePendingSessions } from "../features/converstationSlice";
import { GenesysCloudMediaSession, IPendingSession } from 'genesys-cloud-streaming-client';
import { setSdk } from "../features/sdkSlice";

interface IAuthData {
    token: string;
    environment: {
        clientId: string;
        uri: string;
    };
}

export default function useWebRtcSdk() {
    let webrtcSdk: GenesysCloudWebrtcSdk;

    const dispatch = useDispatch();

    const sdk = useSelector((state: any) => state.sdk.sdk);

    async function initWebrtcSDK(authData: IAuthData) {
        const options: ISdkConfig = {
            accessToken: authData.token,
            environment: authData.environment.uri,
            originAppId: v4(),
            originAppName: 'webrtc-demo-app',
            optOutOfTelemetry: true,
            logLevel: 'info',
        };

        webrtcSdk = new GenesysCloudWebrtcSdk(options);
        dispatch(setSdk(webrtcSdk));
        connectEventHandlers();
        await webrtcSdk.initialize();
    }

    function connectEventHandlers() {
        webrtcSdk.on('disconnected', () => console.log("disconnected"));
        webrtcSdk.on('connected', () => console.log("connected"));

        webrtcSdk.on('pendingSession', handlePendingSession);
        webrtcSdk.on('handledPendingSession', handledPendingSession);

        webrtcSdk.on('conversationUpdate', (event: ISdkConversationUpdateEvent) =>
            handleConversationUpdate(event)
        );

        webrtcSdk.on('sessionEnded', (session) => handleSessionEnded(session));

    }

    async function destroySdk(): Promise<void> {
        await sdk.destroy();
    }


    function startSoftphoneSession(phoneNumber: string) {
        if (!phoneNumber) {
            console.error('Must enter a valid phone number.');
            return;
        }
        sdk.startSoftphoneSession({ phoneNumber });
    }

    function endSession(conversationId: string): void {
        sdk.endSession({ conversationId });
    }


    function handleConversationUpdate(update: ISdkConversationUpdateEvent): void {
        dispatch(updateConversations(update));
    }


    async function toggleAudioMute(mute: boolean, conversationId: string): Promise<void> {
        await sdk.setAudioMute({ mute, conversationId });
    }

    function handlePendingSession(pendingSession: IPendingSession): void {
        dispatch(updatePendingSessions(pendingSession));
    }

    function handledPendingSession(pendingSession: ISessionIdAndConversationId): void {
        dispatch(removePendingSession(pendingSession));
        dispatch(storeHandledPendingSession(pendingSession))
    }

    function disconnectPersistentConnection(): void {
        const sessions = sdk.sessionManager.getAllActiveSessions().filter((session: GenesysCloudMediaSession) => session.sessionType === SessionTypes.softphone);
        sessions.forEach((session: GenesysCloudMediaSession) => sdk.forceTerminateSession(session.id));
    }

    function handleSessionEnded(session: IExtendedMediaSession) {
        console.log("IExtendedMediaSession", session);
    }

    return {
        initWebrtcSDK,
        destroySdk,
        startSoftphoneSession,
        toggleAudioMute,
        handlePendingSession,
        handledPendingSession,
        endSession,
        disconnectPersistentConnection
    }
}