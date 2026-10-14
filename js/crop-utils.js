// V2.7 reusable non-destructive crop values. Projects store only presentation metadata.
export const CROP_RATIOS = ['original','square','portrait','portrait34','portrait23','social916','landscape','classic'];
export const CROP_ASPECTS = { square:1, portrait:4/5, portrait34:3/4, portrait23:2/3, social916:9/16, landscape:16/9, classic:3/2 };
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
export function normalizedCrop(value) {
 const c=value && typeof value==='object' ? value : {};
 return {
  x: Number.isFinite(Number(c.x)) ? clamp(Number(c.x),0,100) : 50,
  y: Number.isFinite(Number(c.y)) ? clamp(Number(c.y),0,100) : 50,
  zoom: Number.isFinite(Number(c.zoom)) ? clamp(Number(c.zoom),1,2.5) : 1
 };
}
export function imageCropCss(value) {
 const c=normalizedCrop(value);
 return `object-position:${c.x.toFixed(2)}% ${c.y.toFixed(2)}%;transform-origin:${c.x.toFixed(2)}% ${c.y.toFixed(2)}%;transform:scale(${c.zoom.toFixed(3)});`;
}
export function dragCrop(value, dx,dy, viewportWidth,viewportHeight, originalWidth,originalHeight) {
 const c=normalizedCrop(value);
 const fit=Math.max(viewportWidth/originalWidth,viewportHeight/originalHeight);
 const availableX=Math.max(0,originalWidth*fit*c.zoom-viewportWidth);
 const availableY=Math.max(0,originalHeight*fit*c.zoom-viewportHeight);
 return {
  ...c,
  x:availableX>.5?clamp(c.x-100*dx/availableX,0,100):c.x,
  y:availableY>.5?clamp(c.y-100*dy/availableY,0,100):c.y
 };
}
