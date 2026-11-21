import imageSizes from '../data/image-sizes.json';
const sizes: Record<string, {width: number; height: number}> = imageSizes;
export const imageSize = (src: string) => sizes[src];
