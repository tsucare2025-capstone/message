export function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};