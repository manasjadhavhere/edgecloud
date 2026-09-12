// src/utils/masks.js
export const getMaskImage = (theme) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    // Simple black silhouettes that wordcloud2 can use as masks
    if (theme === "iconic") {
      // Crown shape
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 100 100">
          <path d="M10,90 L90,90 L95,40 L75,60 L50,20 L25,60 L5,40 Z" fill="#000" />
        </svg>
      `;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    } else if (theme === "tech") {
      // Cloud shape
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 100 100">
          <path d="M25,80 C10,80 10,60 20,55 C20,35 50,30 60,45 C75,35 90,45 90,65 C95,85 75,80 65,80 Z" fill="#000" />
        </svg>
      `;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    } else {
      resolve(null);
      return;
    }

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};
