type EscHandler = () => void;

const stack: EscHandler[] = [];

let isListenerRegistered = false;

const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && stack.length > 0) {
        const handler = stack[stack.length - 1]!;
        handler();
    }
};

export function pushEscHandler(handler: EscHandler) {
    if (!isListenerRegistered) {
        document.addEventListener('keydown', onKeyDown);
        isListenerRegistered = true;
    }
    stack.push(handler);
}

export function popEscHandler() {
    stack.pop();
    if (stack.length === 0 && isListenerRegistered) {
        document.removeEventListener('keydown', onKeyDown);
        isListenerRegistered = false;
    }
}