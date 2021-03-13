import React, {useEffect, useState} from 'react';
import './App.css';
import { useCanvas, canvasHelper } from './hooks/canvasHooks';

const COLORS = ['red', 'blue', 'green'];

function App() {
  const { context, canvasEl } = useCanvas();
  const [color, setColor] = useState('red');
  useEffect(() => {
    if (!context) return;
    const helper = canvasHelper({ context, canvasEl });

    helper.clearAll();

    context.fillStyle = color;
    context.fillRect(0, 0, helper.getCanvasWidth(), helper.getCanvasHeight());
  }, [color, context, canvasEl]);
  return (
    <div className="App">
      <h1>Canvas Drawing App</h1>
      <canvas ref={canvasEl} />
      <div className="buttons">
        {COLORS.map(c => (<button key={c} onClick={() => setColor(c)}>{c}</button>))}
      </div>
    </div>
  );
}

export default App;
