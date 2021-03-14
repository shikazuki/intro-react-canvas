import React, {useCallback, useEffect, useMemo, useState} from 'react';
import './App.css';
import { useCanvas, canvasHelper } from './hooks/canvasHooks';
import {TextBox, Shape} from './shape';
import {useArray} from "./hooks/arrayHooks";


interface ShapeState {
  activatedId: string;
  dragged: boolean;
  touchedX: number;
  touchedY: number;
}
interface ChangeShapeState {
  click: (shape: Shape) => void;
  dragStart: (e: React.MouseEvent<HTMLCanvasElement>, shape: Shape) => void;
  dragEnd: () => void;
}
function useShapeState(): [state: ShapeState, func: ChangeShapeState] {
  const [shapeState, setShapeState] = useState<ShapeState>({ activatedId: '', dragged: false, touchedX: 0, touchedY: 0 });

  return [
    shapeState,
    {
      click: useCallback((shape: Shape) => {
        setShapeState((state) => ({...state, activatedId: shape.id}));
      }, []),
      dragStart: useCallback((e: React.MouseEvent<HTMLCanvasElement>, shape: Shape) => {
        setShapeState({
          activatedId: shape.id,
          dragged: true,
          touchedX: (e.clientX - e.currentTarget.offsetLeft) - shape.x,
          touchedY: (e.clientY - e.currentTarget.offsetTop) - shape.y
        });
      }, []),
      dragEnd: useCallback(() => {
        setShapeState((state) => ({
          ...state,
          dragged: false,
          touchedX: 0,
          touchedY: 0
        }));
      }, []),
    }
  ]
}

const findTouchedShape = (shapes: Array<Shape>, e: React.MouseEvent<HTMLCanvasElement>, withResizePoint: boolean = false): Shape | undefined => {
  return shapes
    .filter(b => b.isTouchedIn(e) || (withResizePoint && b.isTouchedResizePoint(e)))
    .reduce((touchedBox: Shape | undefined, box: Shape) => {
      if (touchedBox === undefined) return box;
      return touchedBox.index <= box.index ? box : touchedBox;
    }, undefined);
};

function App() {
  const { context, canvasEl } = useCanvas();
  const [shapes, setShapes] = useArray<Shape | TextBox>();
  const [shapeState, setShapeState] = useShapeState();
  const {activatedId} = shapeState;
  const [resized, setResized] = useState(false);
  useEffect(() => {
    if (!context) return;
    const helper = canvasHelper({ context, canvasEl });

    helper.clearAll();

    shapes.forEach(b => b.draw(context, activatedId));
  }, [context, canvasEl, shapes, activatedId]);
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
                    const touchedBox = findTouchedShape(shapes, e);
                    if (touchedBox) {
                      setShapeState.click(touchedBox);
                      return;
                    }
                  }}
                  onDoubleClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (!rect) return;
                    const touchedBox = findTouchedShape(shapes, e);
                    if (touchedBox) {
                      setShapeState.click(touchedBox);
                      setShapes.replace((s) => {
                        if (!(s instanceof TextBox)) return s;
                        if (s.id !== touchedBox.id) return s;
                        let copy = s.clone()
                        copy.isEditing = true;
                        return copy;
                      });
                    }
                  }}
                  onMouseDown={(e: React.MouseEvent<HTMLCanvasElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (!rect) return;
                    const touchedBox = findTouchedShape(shapes, e, true);
                    if (!touchedBox) return;

                    if (activatedId !== '' && touchedBox.isTouchedResizePoint(e)) {
                      setResized(true);
                      return;
                    }

                    if (touchedBox) {
                      setShapeState.dragStart(e, touchedBox);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (shapeState.dragged){
                      setShapes.replace((s) => {
                        if (s.id !== activatedId) return s;
                        let copy = s.clone()
                        copy.x = e.clientX - e.currentTarget.offsetLeft - shapeState.touchedX;
                        copy.y = e.clientY - e.currentTarget.offsetTop - shapeState.touchedY;
                        return copy;
                      });
                      return;
                    }
                    if (resized) {
                      setShapes.replace((s) => {
                        if (s.id !== activatedId) return s;
                        let copy = s.clone()
                        copy.width = e.clientX - e.currentTarget.offsetLeft - copy.x;
                        copy.height = e.clientY - e.currentTarget.offsetTop - copy.y;
                        return copy;
                      });
                    }
                  }}
                  onMouseUp={() => {
                    if (shapeState.dragged) {
                      setShapeState.dragEnd();
                    }
                    if (resized) {
                      setResized(false);
                    }
                  }}
          />

          {shapes.map(b => {
            if (!(b instanceof TextBox)) return null;
            if (!b.isEditing) return null;
            return <textarea key={b.id} className="editor"
                             defaultValue={b.text}
                             onBlur={(e) => {
                               setShapes.replace((s) => {
                                 if (!(s instanceof TextBox)) return s;
                                 if (s.id !== b.id) return s;
                                 let copy = s.clone();
                                 copy.text = e.currentTarget.value;
                                 copy.isEditing = false;
                                 return copy;
                               });
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
                const maxIndex = Math.max(...shapes.map(b => b.index), 0) + 1;
                setShapes.add(new TextBox('', 10, 10, 150, 50, maxIndex));
              }}>TextBox</button>
            </div>
          </section>
          <ShapeStyle shape={shapes.find(b => b.id === activatedId)}
                      changeShape={(shape: Shape) => setShapes.replace((s) => {
                        return shape.id === s.id ? shape : s;
                      })} />
        </div>
      </section>

    </div>
  );
}

interface ShapeStyleProps {
  shape: Shape | undefined;
  changeShape: (shape: Shape) => void;
}

function ShapeStyle(props: ShapeStyleProps) {
  const { shape } = props;
  const clone = useMemo<Shape | undefined>(() => (shape ? shape.clone() : undefined), [shape]);
  if (clone === undefined) return null;

  return (
    <section>
      <h3>Box Style</h3>
      <div className="edit-body">
        {
          clone instanceof TextBox && (
            <>
              <div className="form-item">
                <label>Text</label>
                <input type="text" value={clone.text} onChange={(e) => {
                  clone.text = e.target.value;
                  props.changeShape(clone);
                }} />
              </div>
              <div className="form-item">
                <label>Font Color</label>
                <input type="text" value={clone.fontColor} onChange={(e) => {
                  clone.fontColor = e.target.value;
                  props.changeShape(clone);
                }} />
              </div>
            </>
          )
        }
        <div className="form-group">
          <div className="form-item">
            <label>x</label>
            <input type="text" value={clone.x} onChange={(e) => {
              const value = Number(e.target.value);
              if (isNaN(value)) return;
              clone.x = value;
              props.changeShape(clone);
            }} />
          </div>
          <div className="form-item">
            <label>y</label>
            <input type="text" value={clone.y} onChange={(e) => {
              const value = Number(e.target.value);
              if (isNaN(value)) return;
              clone.y = value;
              props.changeShape(clone);
            }} />
          </div>
        </div>
        <div className="form-group">
          <div className="form-item">
            <label>width</label>
            <input type="text" value={clone.width} onChange={(e) => {
              const value = Number(e.target.value);
              if (isNaN(value)) return;
              clone.width = value;
              props.changeShape(clone);
            }} />
          </div>
          <div className="form-item">
            <label>height</label>
            <input type="text" value={clone.height} onChange={(e) => {
              const value = Number(e.target.value);
              if (isNaN(value)) return;
              clone.height = value;
              props.changeShape(clone);
            }} />
          </div>
        </div>
        <div className="form-item">
          <label>Background Color</label>
          <input type="text" value={clone.color} onChange={(e) => {
            clone.color = e.target.value;
            props.changeShape(clone);
          }} />
        </div>
      </div>
    </section>
  )
}


export default App;
