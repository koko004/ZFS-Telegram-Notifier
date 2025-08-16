
export type DiskStatus = 'online' | 'degraded' | 'faulted' | 'offline' | 'unavailable';

export interface Disk {
  id: number;
  zfsId: string;
  name: string;
  path: string;
  model: string;
  status: DiskStatus;
  errors: {
    read: number;
    write: number;
    checksum: number;
  };
  size?: number; // in GB
  temperature?: number; // in Celsius
  smartData?: string;
  smartAnalysis?: string;
}

export type PoolTopologyType = 'stripe' | 'mirror' | 'raidz1' | 'raidz2' | 'raidz3';

export interface VDev {
  type: PoolTopologyType;
  disks: Disk[];
  allocated?: number; // in GB
  free?: number; // in GB
}

export type PoolStatus = 'online' | 'degraded' | 'faulted';

export interface Pool {
  id: string;
  name: string;
  status: PoolStatus;
  vdevs: VDev[];
  logs: string[];
  size: number; // in GB
  allocated: number; // in GB
  free: number; // in GB
  errorAnalysis?: {
    isAnomaly: boolean;
    explanation: string;
  };
  remoteAddress: string;
}

export type PoolInput = Omit<Pool, 'id'>;


export interface Settings {
    telegram: {
        botToken: string;
        chatId: string;
    };
    googleAiApiKey?: string;
    notifications: {
        poolDegraded: boolean;
        poolFaulted: boolean;
        diskErrors: boolean;
        smartFailures: boolean;
    };
}
