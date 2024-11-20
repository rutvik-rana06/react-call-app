import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  authenticate,
  getPresenceDefinitions,
  getUserMe,
  getUserPresence,
  getUserVoiceChannelStatus,
} from '../utils/gensysUtils';
import useWebRtcSdk from '../../hooks/useWebRtcSdk';
import { clientConfig } from '../clientConfig';
interface IUserDetails {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  presence: string;
  state: string;
}

export interface Status {
  id: string;
  systemPresence: string;
  color: string;
}

interface UserContextType {
  user: IUserDetails | null;
  loading: boolean;
  statusOptions: Status[];
  selectedStatus: Status | null;
  setSelectedStatus: (status: Status) => void;
  voiceChannelStatus: Status | null;
  setVoiceChannelStatus: (status: Status) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [voiceChannelStatus, setVoiceChannelStatus] = useState<Status | null>(
    null
  );

  const { initWebrtcSDK } = useWebRtcSdk();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authData = await authenticate();
        localStorage.setItem('access_token', authData.accessToken);
        const userDetails = await getUserMe();
        const avatarUrl =
          userDetails.images?.[userDetails.images?.length - 1]?.imageUri || '';
        const userPresence =
          userDetails.presence?.presenceDefinition?.systemPresence || '';
        const userData = {
          id: userDetails.id,
          email: userDetails.email,
          name: userDetails.name,
          avatarUrl,
          presence: userPresence,
          state: userDetails.state,
        };
        setUser(userData);

        const statusOptions = await getPresenceDefinitions();
        const options =
          statusOptions?.entities?.map((entity: any) => ({
            id: entity.id,
            systemPresence: entity.systemPresence,
            color:
              entity.systemPresence === 'Available' ? '#008767' : '#EA700B',
          })) || [];

        setStatusOptions(options);

        const userStatusPresence = await getUserPresence(userDetails.id);
        const currentStatus = options.find(
          (status) =>
            status.systemPresence ===
            userStatusPresence?.presenceDefinition?.systemPresence
        );
        setSelectedStatus(currentStatus || null);

        const voiceChannelResponse = await getUserVoiceChannelStatus(
          userDetails.id
        );
        const voiceChannelStatus = {
          id: '1',
          systemPresence: voiceChannelResponse?.status || '',
          color:
            voiceChannelResponse?.status === 'OFF_QUEUE'
              ? '#008767'
              : '#EA700B',
        };
        setVoiceChannelStatus(voiceChannelStatus);

        await initWebrtcSDK({
          token: localStorage.getItem('access_token') || '',
          environment: {
            uri: 'mypurecloud.com',
            clientId: clientConfig.clientId,
          },
        });
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        statusOptions,
        selectedStatus,
        setSelectedStatus,
        voiceChannelStatus,
        setVoiceChannelStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
