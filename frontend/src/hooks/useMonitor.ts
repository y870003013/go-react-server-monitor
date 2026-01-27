import { useState, useEffect } from 'react';
import { HostStats } from '../types/monitor';

export const useMonitor = (url: string) => {
    const [hosts, setHosts] = useState<HostStats[]>([]);
    const [now, setNow] = useState(Date.now() / 1000);

    useEffect(() => {
        const ws = new WebSocket(url);
        ws.onmessage = (event) => {
            const data: HostStats[] = JSON.parse(event.data);
            setHosts(data || []);
        };

        const ticker = setInterval(() => setNow(Date.now() / 1000), 1000);
        return () => {
            ws.close();
            clearInterval(ticker);
        };
    }, [url]);

    return { hosts, now };
};