import { clientConfig } from "../clientConfig";
import platformClient from 'purecloud-platform-client-v2';

const client = platformClient.ApiClient.instance;
const { clientId, redirectUri } = clientConfig;
const usersApi = new platformClient.UsersApi();
const presenceApi = new platformClient.PresenceApi();
const analyticsApi = new platformClient.AnalyticsApi();


const cache: any = {}

export function authenticate() {
    return client.loginImplicitGrant(clientId, redirectUri, { state: 'state' })
        .then((data: any) => {
            return data;
        })
        .catch((err: any) => {
            console.error(err);
        });
}

export async function getUserMe(skipCache: boolean = false) {
    if (skipCache) {
        return usersApi.getUsersMe({
            expand: ['routingStatus', 'presence'],
        });
    } else if (cache['userMe']) {
        return cache['userMe'];
    } else {
        try {
            cache['userMe'] = await usersApi.getUsersMe({
                expand: ['routingStatus', 'presence'],
            });
            return cache['userMe'];
        } catch (err) {
            console.error(err)
        }
    }
}


export async function getUserPresence(userId: string) {
    try {
        return presenceApi.getUserPresencesPurecloud(userId);
    } catch (err) {
        console.error(err);
    }
}

export async function getPresenceDefinitions() {
    try {
        return presenceApi.getPresenceDefinitions0();
    } catch (err) {
        console.error(err);
    }
}

export async function updateUserPresence(userId: string, body: platformClient.Models.UserPresence) {
    try {
        return presenceApi.patchUserPresencesPurecloud(userId, body);
    } catch (err) {
        console.error(err);
    }
}

export async function getUserVoiceChannelStatus(userId: string) {
    try {
        return usersApi.getUserRoutingstatus(userId)
    }
    catch (err) {
        console.error(err)
    }
}


export async function getStatisticsData(body: platformClient.Models.ConversationAggregationQuery) {
    try {
        return analyticsApi.postAnalyticsConversationsAggregatesQuery(body)
    } catch (err) {
        console.error(err)
    }
}