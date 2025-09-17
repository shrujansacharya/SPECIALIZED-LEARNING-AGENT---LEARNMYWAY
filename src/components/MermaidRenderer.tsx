import React, { useEffect, useRef, memo } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'sans-serif',
});

interface MermaidRendererProps {
  chart: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Put the raw chart text into the div
      containerRef.current.innerHTML = chart;
      // Let Mermaid find the element with the 'mermaid' class and render it.
      // This is more stable than the previous method.
      try {
          mermaid.run({
              nodes: [containerRef.current],
          });
      } catch(error) {
          if (containerRef.current) {
              // On error, show a helpful message
              containerRef.current.innerHTML = `<div class="p-3 text-yellow-200 bg-red-900/50 rounded-lg"><p class="font-semibold">Diagram Error</p></div>`;
          }
          console.error("Mermaid run error:", error);
      }
    }
  }, [chart]);

  // We add the "mermaid" class so the library knows what to render.
  return <div ref={containerRef} className="mermaid">{chart}</div>;
};

// Use memo to prevent re-renders unless the chart code actually changes
export default memo(MermaidRenderer);