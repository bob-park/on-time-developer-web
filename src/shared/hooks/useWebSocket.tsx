'use client';

import { useEffect, useState } from 'react';

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketProps {
  host: string;
  auth?: {
    userId: string;
  };
  destination: {
    pub?: string;
    sub?: string;
  };
  onConnect?: () => void;
  onSubscribe?: (data: string) => void;
  onClose?: () => void;
}

export default function useWebSocket({
  host,
  auth,
  destination,
  onConnect,
  onSubscribe,
  onClose,
}: Readonly<WebSocketProps>) {
  // state
  const [client, setClient] = useState<Client>();

  // useEffect
  useEffect(() => {
    let subscription: StompSubscription | null = null;

    const wsClient = new Client({
      webSocketFactory: () => new SockJS(host),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        if (destination.sub) {
          subscription = wsClient.subscribe(
            destination.sub,
            (message) => {
              onSubscribe && onSubscribe(message.body);
            },
            {
              userId: auth?.userId || '',
            },
          );
        }
      },
      onDisconnect: () => {},
    });

    setClient(wsClient);
    wsClient.activate();

    onConnect?.();

    return () => {
      subscription &&
        subscription.unsubscribe({ destination: destination.sub || '', userUniqueId: auth?.userId || '' });

      onClose?.();

      wsClient.deactivate();
    };
  }, []);

  return [client];
}
