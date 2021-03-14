import React, {useEffect, useState} from 'react';
import './App.css';
import { useCanvas, canvasHelper } from './hooks/canvasHooks';
import { Box } from './shape';

function App() {
  const { context, canvasEl } = useCanvas();
  const [boxes, setBoxes] = useState<Array<Box>>([]);
  const [activeId, setActiveId] = useState('');
  const [dragged, setDragged] = useState(false);
  const [resized, setResized] = useState(false);
  useEffect(() => {
    if (!context) return;
    const helper = canvasHelper({ context, canvasEl });

    helper.clearAll();

    boxes.forEach(b => b.draw(context, activeId));
  }, [context, canvasEl, boxes, activeId]);
  return (
    <div className="app">
      <h1 className="title">Canvas Drawing App</h1>
      <section className="drawing-area">

        <div className="canvas-area">
          <canvas ref={canvasEl}
                  width={1200}
                  height={700}
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
                  onDoubleClick={(e) => {
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
                      const newBoxes = boxes.map(b => {
                        if (b.id !== touchedBox.id) return b;
                        b.isEditing = true;
                        return b;
                      });
                      setBoxes(newBoxes);
                      return;
                    }
                  }}
                  onMouseDown={(e: React.MouseEvent<HTMLCanvasElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (!rect) return;
                    const touchedBox = boxes
                      .filter(b => b.isTouchedIn(e) || b.isTouchedResizePoint(e))
                      .reduce((touched: Box | null, box: Box) => {
                        if (touched === null) return box;
                        if (touched.index <= box.index) return box;
                        return touched;
                      }, null);
                    if (!touchedBox) return;

                    if (activeId !== '' && touchedBox.isTouchedResizePoint(e)) {
                      setResized(true);
                      return;
                    }

                    if (touchedBox) {
                      setActiveId(touchedBox.id);
                      setDragged(true);
                      const newBoxes = boxes.map(b => {
                        if (b.id !== touchedBox.id) return b;
                        b.touchedX = (e.clientX - e.currentTarget.offsetLeft) - b.x;
                        b.touchedY = (e.clientY - e.currentTarget.offsetTop) - b.y;
                        return b;
                      });
                      setBoxes(newBoxes);
                      return;
                    }
                  }}
                  onMouseMove={(e) => {
                    if (dragged){
                      const newBoxes = boxes.map(b => {
                        if (b.id !== activeId) return b;
                        b.x = e.clientX - e.currentTarget.offsetLeft - b.touchedX;
                        b.y = e.clientY - e.currentTarget.offsetTop - b.touchedY;
                        return b;
                      });
                      setBoxes(newBoxes);
                      return;
                    }
                    if (resized) {
                      const newBoxes = boxes.map(b => {
                        if (b.id !== activeId) return b;
                        b.width = e.clientX - e.currentTarget.offsetLeft - b.x;
                        b.height = e.clientY - e.currentTarget.offsetTop - b.y;
                        return b;
                      });
                      setBoxes(newBoxes);
                    }
                  }}
                  onMouseUp={() => {
                    if (dragged) {
                      setDragged(false);
                      const newBoxes = boxes.map(b => {
                        if (b.id !== activeId) return b;
                        b.touchedX = 0;
                        b.touchedY = 0;
                        return b;
                      });
                      setBoxes(newBoxes);
                    }
                    if (resized) {
                      setResized(false);
                    }
                  }}
          />

          {boxes.map(b => {
            if (!b.isEditing) return null;
            return <textarea key={b.id} className="editor"
                             defaultValue={b.text}
                             onBlur={(e) => {
                               const newBoxes = boxes.map(b => {
                                 if (b.id !== activeId) return b;
                                 b.text = e.currentTarget.value;
                                 b.isEditing = false;
                                 return b;
                               });
                               setBoxes(newBoxes);
                             }}
                             style={{
                               left: b.x + (canvasEl.current?.offsetLeft ?? 0),
                               top: b.y + (canvasEl.current?.offsetTop ?? 0),
                               width: b.width,
                               height: b.height,
                             }}

            />
          })}
        </div>
        <div className="edit-area">
          <section>
            <h3>Add</h3>
            <div className="edit-body buttons">
              <button className="button icon" onClick={() => {
                const maxIndex = Math.max(...boxes.map(b => b.index)) + 1;
                setBoxes([...boxes, new Box(10, 10, 150, 50, maxIndex)]);
              }}>Box</button>
            </div>
          </section>
          <BoxStyle box={boxes.find(b => b.id === activeId)} />
        </div>
      </section>

    </div>
  );
}

interface BoxStyleProps {
  box: Box | undefined;
}

function BoxStyle(props: BoxStyleProps) {
  const { box } = props;
  if (box === undefined) return null;

  return (
    <section>
      <h3>Box Style</h3>
      <div className="edit-body">
        <div className="form-item">
          <label>Text</label>
          <input type="text" value={box.text} />
        </div>
        <div className="form-group">
          <div className="form-item">
            <label>x</label>
            <input type="text" value={box.x} />
          </div>
          <div className="form-item">
            <label>y</label>
            <input type="text" value={box.y} />
          </div>
        </div>
        <div className="form-group">
          <div className="form-item">
            <label>width</label>
            <input type="text" value={box.width} />
          </div>
          <div className="form-item">
            <label>height</label>
            <input type="text" value={box.height} />
          </div>
        </div>
      </div>
    </section>
  )
}


export default App;
