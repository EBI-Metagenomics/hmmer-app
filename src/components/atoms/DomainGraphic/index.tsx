import React, { useEffect, useRef, useState } from 'react';

interface DomainGraphicProps {
    sequence,
    width: number,
    height: number,
}

const DomainGraphic: React.FC<DomainGraphicProps> = ({ sequence, width = 800, height = 200 }) => {
  const canvasRef = useRef(null);
  const [imageParams] = useState({
    headSizeCircle: 3,
    headSizeSquare: 6,
    headSizeDiamond: 4,
    headSizeArrow: 3,
    headSizePointer: 3,
    headSizeLine: 3,
    sequenceEndPadding: 2,
    xOffset: 0,
    yOffset: 0,
    defaultMarkupHeight: 20,
    lollipopToLollipopIncrement: 7,
    bridgeToBridgeIncrement: 2,
    bridgeToLollipopIncrement: 5,
    largeJaggedSteps: 6,
    fontSize: '10px',
    regionHeight: 20,
    motifHeight: 14,
    motifOpacity: 0.6,
    labelPadding: 3,
    residueWidth: 0.5,
    xscale: 1.0,
    yscale: 1.0,
    envOpacity: 0.6,
    highlightWeight: 1,
    highlightColour: '#000'
  });

  useEffect(() => {
    if (!canvasRef.current || !sequence) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sequence base
    drawSequence(ctx);
    
    // Draw regions
    if (sequence.regions) {
      sequence.regions.forEach(region => drawRegion(ctx, region));
    }
    
    // Draw motifs
    if (sequence.motifs) {
      sequence.motifs.forEach(motif => drawMotif(ctx, motif));
    }
    
    // Draw markups (bridges and lollipops)
    if (sequence.markups) {
      sequence.markups.forEach(markup => {
        if (markup.end) {
          drawBridge(ctx, markup);
        } else {
          drawLollipop(ctx, markup);
        }
      });
    }
  }, [sequence, width, height, imageParams]);

  const drawSequence = (ctx) => {
    const baseline = height / 2;
    const seqHeight = imageParams.regionHeight / 6;
    
    // Draw sequence background
    ctx.fillStyle = '#eee';
    ctx.fillRect(
      imageParams.sequenceEndPadding, 
      baseline - seqHeight/2,
      width - (imageParams.sequenceEndPadding * 2),
      seqHeight
    );
    
    // Draw sequence length label
    ctx.fillStyle = '#000';
    ctx.font = `${imageParams.fontSize} Arial`;
    ctx.fillText(
      sequence.length.toString(),
      width - imageParams.sequenceEndPadding - 30,
      baseline + seqHeight
    );
  };

  const drawRegion = (ctx, region) => {
    const baseline = height / 2;
    const regionHeight = imageParams.regionHeight;
    const x = region.start * imageParams.residueWidth + imageParams.sequenceEndPadding;
    const y = baseline - (regionHeight / 2);
    const width = (region.end - region.start) * imageParams.residueWidth;
    
    // Draw region background
    ctx.fillStyle = region.color || '#6666';
    ctx.fillRect(x, y, width, regionHeight);
    
    // Draw region border
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x, y, width, regionHeight);
    
    // Draw text if specified
    if (region.text) {
      ctx.fillStyle = '#000';
      ctx.font = `${imageParams.fontSize} Arial`;
      ctx.fillText(
        region.text,
        x + width/2 - ctx.measureText(region.text).width/2,
        y + regionHeight/2 + 4
      );
    }
  };

  const drawMotif = (ctx, motif) => {
    const baseline = height / 2;
    const motifHeight = imageParams.motifHeight;
    const x = motif.start * imageParams.residueWidth + imageParams.sequenceEndPadding;
    const y = baseline - (motifHeight / 2);
    const width = (motif.end - motif.start) * imageParams.residueWidth;

    ctx.fillStyle = motif.color || '#999';
    ctx.globalAlpha = imageParams.motifOpacity;
    ctx.fillRect(x, y, width, motifHeight);
    ctx.globalAlpha = 1.0;
  };

  const drawLollipop = (ctx, markup) => {
    const baseline = height / 2;
    const x = markup.start * imageParams.residueWidth + imageParams.sequenceEndPadding;
    const isTop = !markup.v_align || markup.v_align === 'top';
    
    // Draw stem
    ctx.beginPath();
    ctx.moveTo(x, baseline);
    ctx.lineTo(x, isTop ? baseline - imageParams.defaultMarkupHeight : baseline + imageParams.defaultMarkupHeight);
    ctx.strokeStyle = markup.lineColour || '#000';
    ctx.stroke();
    
    // Draw head
    const headY = isTop ? 
      baseline - imageParams.defaultMarkupHeight : 
      baseline + imageParams.defaultMarkupHeight;
      
    switch (markup.headStyle) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x, headY, imageParams.headSizeCircle, 0, Math.PI * 2);
        ctx.fillStyle = markup.color || '#f00';
        ctx.fill();
        break;
      case 'square':
        const size = imageParams.headSizeSquare;
        ctx.fillStyle = markup.color || '#64c809';
        ctx.fillRect(x - size/2, headY - size/2, size, size);
        break;
      // Add other head styles as needed
    }
  };

  const drawBridge = (ctx, markup) => {
    const baseline = height / 2;
    const x1 = markup.start * imageParams.residueWidth + imageParams.sequenceEndPadding;
    const x2 = markup.end * imageParams.residueWidth + imageParams.sequenceEndPadding;
    const isTop = !markup.v_align || markup.v_align === 'top';
    const bridgeHeight = imageParams.defaultMarkupHeight;
    
    ctx.beginPath();
    ctx.moveTo(x1, baseline);
    ctx.lineTo(x1, isTop ? baseline - bridgeHeight : baseline + bridgeHeight);
    ctx.lineTo(x2, isTop ? baseline - bridgeHeight : baseline + bridgeHeight);
    ctx.lineTo(x2, baseline);
    ctx.strokeStyle = markup.color || '#000';
    ctx.stroke();
  };

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
};

export default DomainGraphic;