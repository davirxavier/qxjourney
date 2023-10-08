export function processBasePathUrl(path: string): string {
    if (!path) return '';

    let uri = path;

    if (uri) {
        uri = uri.endsWith('/') ? uri.substring(0, uri.length) : uri;
        uri = uri.startsWith('/') ? uri : '/' + uri;
    }

    return uri.replace('\\', '');
}