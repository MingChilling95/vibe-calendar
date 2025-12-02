import { useState, useEffect, useRef } from 'react';

const PomodoroTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../../workers/timer.worker.ts', import.meta.url));

        workerRef.current.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'TICK') {
                setTimeLeft(payload);
            } else if (type === 'COMPLETE') {
                setIsActive(false);
                new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => { });
                if (Notification.permission === 'granted') {
                    new Notification("Time's up!", { body: "Take a break!" });
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const toggleTimer = () => {
        if (isActive) {
            workerRef.current?.postMessage({ type: 'PAUSE' });
        } else {
            workerRef.current?.postMessage({ type: 'START', payload: timeLeft });
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        const newTime = mode === 'focus' ? 25 * 60 : 5 * 60;
        setTimeLeft(newTime);
        setIsActive(false);
        workerRef.current?.postMessage({ type: 'RESET', payload: newTime });
    };

    const switchMode = (newMode: 'focus' | 'break') => {
        setMode(newMode);
        const newTime = newMode === 'focus' ? 25 * 60 : 5 * 60;
        setTimeLeft(newTime);
        setIsActive(false);
        workerRef.current?.postMessage({ type: 'RESET', payload: newTime });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <button
                    onClick={() => switchMode('focus')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: mode === 'focus' ? 'var(--bg-tertiary)' : 'transparent',
                        color: 'var(--text-primary)',
                        fontWeight: 500
                    }}
                >
                    Focus
                </button>
                <button
                    onClick={() => switchMode('break')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: mode === 'break' ? 'var(--bg-tertiary)' : 'transparent',
                        color: 'var(--text-primary)',
                        fontWeight: 500
                    }}
                >
                    Break
                </button>
            </div>

            <div style={{
                fontSize: '120px',
                fontWeight: 200,
                fontVariantNumeric: 'tabular-nums',
                marginBottom: 'var(--spacing-xl)',
                color: 'var(--text-primary)'
            }}>
                {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--text-primary)',
                        color: 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: 'var(--shadow-hover)'
                    }}
                >
                    {isActive ? '⏸' : '▶'}
                </button>

                <button
                    onClick={resetTimer}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        border: '1px solid var(--border-subtle)'
                    }}
                >
                    ↺
                </button>
            </div>
        </div>
    );
};

export default PomodoroTimer;
