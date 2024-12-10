import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private getBackendURL(): string {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }

  connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        reject(new Error('No authentication token found'));
        return;
      }

      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(this.getBackendURL(), {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });
    });

    return this.connectionPromise;
  }

  async emit(event: string, ...args: any[]) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }
      
      const lastArg = args[args.length - 1];
      const hasCallback = typeof lastArg === 'function';
      
      if (hasCallback) {
        this.socket.emit(event, ...args);
      } else {
        this.socket.emit(event, ...args, (response: any) => {
          resolve(response);
        });
      }
    });
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();

// for old socket.ts in case something breaks
const socket = new Proxy(socketService, {
  get(target, prop) {

    if (prop in target) {
      return target[prop as keyof SocketService];
    }
    
    const socketInstance = target.getSocket();
    if (socketInstance && prop in socketInstance) {
      return (socketInstance as any)[prop];
    }
    
    throw new Error(`Method ${String(prop)} not found`);
  }
});

export default socket;