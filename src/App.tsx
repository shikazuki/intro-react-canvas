import React, {useEffect, useState} from 'react';
import './App.css';
import { useCanvas, canvasHelper } from './hooks/canvasHooks';
import { Box } from './shape';

function App() {
  const { context, canvasEl } = useCanvas();
  const [boxes, setBoxes] = useState<Array<Box>>([]);
  const [activeId, setActiveId] = useState('');
  const [dragged, setDragged] = useState(false);
  useEffect(() => {
    if (!context) return;
    const helper = canvasHelper({ context, canvasEl });

    helper.clearAll();

    boxes.forEach(b => b.draw(context, activeId));
  }, [context, canvasEl, boxes, activeId]);
  return (
    <div className="App">
      <h1>Canvas Drawing App</h1>
      <canvas ref={canvasEl}
              width={1200}
              height={500}
              onClick={(e: React.MouseEvent<HTMLCanvasElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (!rect) return;
                const touchedBox = boxes
                  .filter(b => b.isTouchedIn(e))
                  .reduce((touched: Box | null, box: Box) => {
                    if (touched === null) return box;
                    if (touched.index <= box.index) return box;
                    return touched;
                  }, null);
                if (touchedBox) {
                  setActiveId(touchedBox.id);
                  return;
                }
              }}
              onMouseDown={(e: React.MouseEvent<HTMLCanvasElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (!rect) return;
                const touchedBox = boxes
                  .filter(b => b.isTouchedIn(e))
                  .reduce((touched: Box | null, box: Box) => {
                    if (touched === null) return box;
                    if (touched.index <= box.index) return box;
                    return touched;
                  }, null);
                if (touchedBox) {
                  setActiveId(touchedBox.id);
                  setDragged(true);
                  return;
                }
              }}
              onMouseMove={(e) => {
                if (!dragged) return;
                const newBoxes = boxes.map(b => {
                  if (b.id !== activeId) return b;
                  b.x = e.clientX - e.currentTarget.offsetLeft - (b.width / 2);
                  b.y = e.clientY - e.currentTarget.offsetTop - (b.height / 2);
                  return b;
                });
                setBoxes(newBoxes);
              }}
              onMouseUp={() => {
                setDragged(false);
              }}
      />
      <div className="buttons">
        <button className="button" onClick={() => {
          const maxIndex = Math.max(...boxes.map(b => b.index)) + 1;
          setBoxes([...boxes, new Box(10, 10, 30, 30, maxIndex)]);
        }}>Add Box</button>
      </div>
    </div>
  );
}

export default App;
