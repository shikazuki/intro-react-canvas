import {useEffect, useRef, useState} from 'react';

interface useCanvasState {
  canvasEl: React.RefObject<HTMLCanvasElement>;
  context: CanvasRenderingContext2D | null;
}

export const useCanvas = (): useCanvasState =>  {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const canvasEl = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context2d = canvasEl?.current?.getContext('2d');
    if (context2d) {
      setContext(context2d);
    }
  }, []);
  return {
    canvasEl,
    context,
  };
};

interface CanvasHelper {
  clearAll: () => void;
  getCanvasWidth: () => number;
  getCanvasHeight: () => number;
}
export const canvasHelper = ({ context, canvasEl }: useCanvasState): CanvasHelper => {
  return {
    clearAll: () => {
      if (!context) return;
      if (!canvasEl) return;
      if (!canvasEl.current) return;
      context.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
    },
    getCanvasWidth: () => {
      return canvasEl?.current?.width ?? 0;
    },
    getCanvasHeight: () => {
      return canvasEl?.current?.height ?? 0;
    }
  }
};
