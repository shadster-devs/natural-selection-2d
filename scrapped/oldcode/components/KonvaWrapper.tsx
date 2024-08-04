import dynamic from 'next/dynamic';

const Stage = dynamic(() => import('react-konva').then((mod) => mod.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then((mod) => mod.Layer), { ssr: false });
const Circle = dynamic(() => import('react-konva').then((mod) => mod.Circle), { ssr: false });
const Rect = dynamic(() => import('react-konva').then((mod) => mod.Rect), { ssr: false });
export { Stage, Layer, Circle, Rect };
