import React, { forwardRef } from 'react';

const Canvas = forwardRef((props, ref) => {
  return <canvas ref={ref} className="block w-full h-full" {...props} />;
});

export default Canvas;