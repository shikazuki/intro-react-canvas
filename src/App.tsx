import React, {useEffect, useState} from 'react';
import './App.css';
import { useCanvas, canvasHelper } from './hooks/canvasHooks';
import { Box } from './shape';

const COLORS = ['red', 'blue', 'green'];

function App() {
  const { context, canvasEl } = useCanvas();
  const [boxes, setBoxes] = useState<Array<Box>>([]);
  const [color, setColor] = useState('red');
  useEffect(() => {
    if (!context) return;
    const helper = canvasHelper({ context, canvasEl });

    helper.clearAll();

    context.fillStyle = color;
    context.fillRect(0, 0, helper.getCanvasWidth(), helper.getCanvasHeight());
    boxes.forEach(b => b.draw(context));
  }, [color, context, canvasEl, boxes]);
  return (
    <div className="App">
      <h1>Canvas Drawing App</h1>
      <canvas ref={canvasEl} onClick={(e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.x;
        const y = e.clientY - rect.y;
        setBoxes([...boxes, new Box(x, y, 30, 30, 'blue')]);
      }} />
      <div className="buttons">
        {COLORS.map(c => (<button key={c} onClick={() => setColor(c)}>{c}</button>))}
      </div>
    </div>
  );
}

export default App;
