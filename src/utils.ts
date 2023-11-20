export function processBasePathUrl(path: string): string {
    if (!path) return '';

    let uri = path;

    if (uri) {
        uri = uri.endsWith('/') ? uri.substring(0, uri.length) : uri;
        uri = uri.startsWith('/') ? uri : '/' + uri;
    }

    return uri.replace('\\', '');
}

export function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function scale(number, [inMin, inMax], [outMin, outMax]) {
    return (number - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}