/* eslint-disable no-restricted-globals */
let timerId: number | null = null;
let remainingTime = 0;

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'START') {
        remainingTime = payload;
        if (timerId) clearInterval(timerId);

        timerId = self.setInterval(() => {
            remainingTime--;
            self.postMessage({ type: 'TICK', payload: remainingTime });

            if (remainingTime <= 0) {
                if (timerId) clearInterval(timerId);
                self.postMessage({ type: 'COMPLETE' });
            }
        }, 1000);
    } else if (type === 'PAUSE') {
        if (timerId) clearInterval(timerId);
        timerId = null;
    } else if (type === 'RESET') {
        if (timerId) clearInterval(timerId);
        timerId = null;
        remainingTime = payload;
        self.postMessage({ type: 'TICK', payload: remainingTime });
    }
};

export { };
