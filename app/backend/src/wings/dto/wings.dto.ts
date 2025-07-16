export interface ServerInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping';
  cpu: number;
  memory: {
    current: number;
    limit: number;
  };
  disk: {
    current: number;
    limit: number;
  };
  network: {
    rx: number;
    tx: number;
  };
  uptime?: number;
}

export interface ServerActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface WingsApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface ServerDeleteResponse {
  status: 'deleted';
  deletedAt: string;
  dataRemoved: boolean;
}

export interface ServerDeleteOptions {
  removeData?: boolean;
  force?: boolean;
}