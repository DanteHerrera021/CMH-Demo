export function mapCategoryDoc(docSnap) {
    const data = docSnap.data();

    const color = data.color ?? "#4f4f4f";

    return {
        id: docSnap.id,
        name: data.name ?? "",
        color: color,
        textColor: getContrastColor(color),
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
    };
}

function getContrastColor(hex) {
    // Remove the '#' if it's there
    hex = hex.replace('#', '');

    // Convert to RGB
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    // Calculate Luminance
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Return black or white
    return (yiq >= 128) ? 'black' : 'white';
}
