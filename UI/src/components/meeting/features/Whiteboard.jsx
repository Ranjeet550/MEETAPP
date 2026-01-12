import React, { useRef, useEffect, useState } from 'react';
import { 
  FaPencilAlt, 
  FaEraser, 
  FaSquare, 
  FaCircle, 
  FaMinus, 
  FaFont, 
  FaUndo, 
  FaRedo, 
  FaTrash, 
  FaDownload,
  FaMousePointer,
  FaHighlighter,
  FaMagic,
  FaTh,
  FaPlus,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const Whiteboard = ({ isOpen, onClose, socketRef, meetingId, userId }) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const contextRef = useRef(null);
  const overlayContextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil'); 
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  
  // Pages Management
  const [pages, setPages] = useState([{ history: [], redoStack: [] }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);
  const [showGrid, setShowGrid] = useState(false);

  const canvasContainerRef = useRef(null);

  const setupCanvas = (canvas, overlay) => {
    const container = canvasContainerRef.current;
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width === 0 || height === 0) return;

    // Set internal resolution
    canvas.width = width * 2;
    canvas.height = height * 2;
    overlay.width = width * 2;
    overlay.height = height * 2;

    // Set display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    const oCtx = overlay.getContext('2d');
    
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    oCtx.scale(2, 2);
    oCtx.lineCap = 'round';
    oCtx.lineJoin = 'round';
    
    contextRef.current = ctx;
    overlayContextRef.current = oCtx;
  };

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !overlayCanvas || !container) return;

    let isInitial = true;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;

      // Capture current state before resize
      const dataUrl = canvas.toDataURL();
      
      setupCanvas(canvas, overlayCanvas);
      
      if (isInitial) {
        drawBackground(contextRef.current, canvas);
        const initialData = canvas.toDataURL();
        setHistory([initialData]);
        setPages([{ history: [initialData], redoStack: [] }]);
        isInitial = false;
      } else {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          if (contextRef.current) {
            drawBackground(contextRef.current, canvas);
            contextRef.current.drawImage(img, 0, 0, width, height);
          }
        };
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [isOpen]);

  const drawBackground = (ctx, canvas) => {
    if (!ctx || !canvas) return;
    const width = canvas.width / 2;
    const height = canvas.height / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (showGrid) {
      ctx.beginPath();
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (!contextRef.current || !isOpen) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    drawBackground(contextRef.current, canvas);
    
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      contextRef.current.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
  }, [showGrid, isOpen]);

  useEffect(() => {
    if (contextRef.current) {
      if (tool === 'eraser') {
        contextRef.current.strokeStyle = '#ffffff';
      } else if (tool === 'highlighter') {
        contextRef.current.strokeStyle = `${color}44`;
      } else {
        contextRef.current.strokeStyle = color;
      }
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth, tool]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const newHistory = [...history, canvas.toDataURL()];
    setHistory(newHistory);
    setRedoStack([]);
    
    const newPages = [...pages];
    newPages[currentPage] = { history: newHistory, redoStack: [] };
    setPages(newPages);
  };

  const switchPage = (index) => {
    const currentPages = [...pages];
    currentPages[currentPage] = { history, redoStack };
    
    const nextPage = currentPages[index];
    setHistory(nextPage.history);
    setRedoStack(nextPage.redoStack);
    setCurrentPage(index);

    const img = new Image();
    img.src = nextPage.history[nextPage.history.length - 1];
    img.onload = () => {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(contextRef.current, canvas);
      contextRef.current.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
    setPages(currentPages);
  };

  const addPage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Create blank data
    const prevFill = ctx.fillStyle;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const blankData = canvas.toDataURL();
    ctx.fillStyle = prevFill;

    const newPage = { history: [blankData], redoStack: [] };
    const newPages = [...pages];
    newPages[currentPage] = { history, redoStack };
    newPages.push(newPage);
    
    setPages(newPages);
    setCurrentPage(newPages.length - 1);
    setHistory(newPage.history);
    setRedoStack(newPage.redoStack);
    
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(contextRef.current, canvas);
  };

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e.nativeEvent || e);
    const offsetX = x;
    const offsetY = y;
    
    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        contextRef.current.fillStyle = color;
        contextRef.current.font = `${lineWidth * 5}px Arial`;
        contextRef.current.fillText(text, offsetX, offsetY);
        saveToHistory();
      }
      return;
    }

    if (tool === 'laser') {
      drawLaser(offsetX, offsetY);
      return;
    }

    setSnapshot(canvasRef.current.toDataURL());
    setStartPos({ x: offsetX, y: offsetY });
    setIsDrawing(true);

    if (tool === 'pencil' || tool === 'eraser' || tool === 'highlighter') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
    }
  };

  const drawLaser = (x, y) => {
    const ctx = overlayContextRef.current;
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'red';
    
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 1000);
  };

  const draw = (e) => {
    const { x, y } = getCoordinates(e.nativeEvent || e);
    const offsetX = x;
    const offsetY = y;
    
    if (tool === 'laser') {
      drawLaser(offsetX, offsetY);
      return;
    }

    if (!isDrawing) return;
    const context = contextRef.current;
    const canvas = canvasRef.current;

    if (tool === 'pencil' || tool === 'eraser' || tool === 'highlighter') {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    } else {
      const img = new Image();
      img.src = snapshot;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground(context, canvas);
        context.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
        
        context.beginPath();
        if (tool === 'rect') {
          context.rect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
        } else if (tool === 'circle') {
          const radius = Math.sqrt(Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2));
          context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        } else if (tool === 'line') {
          context.moveTo(startPos.x, startPos.y);
          context.lineTo(offsetX, offsetY);
        }
        context.stroke();
      };
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  const undo = () => {
    if (history.length <= 1) return;
    const currentHistory = [...history];
    const lastAction = currentHistory.pop();
    const newRedoStack = [lastAction, ...redoStack];
    setRedoStack(newRedoStack);
    setHistory(currentHistory);

    const img = new Image();
    img.src = currentHistory[currentHistory.length - 1];
    img.onload = () => {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(contextRef.current, canvas);
      contextRef.current.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const currentRedo = [...redoStack];
    const nextAction = currentRedo.shift();
    const newHistory = [...history, nextAction];
    setRedoStack(currentRedo);
    setHistory(newHistory);

    const img = new Image();
    img.src = nextAction;
    img.onload = () => {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(contextRef.current, canvas);
      contextRef.current.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
    };
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    drawBackground(contextRef.current, canvas);
    saveToHistory();
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = `whiteboard-page-${currentPage + 1}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const tools = [
    { id: 'select', icon: <FaMousePointer size={18} />, label: 'Select' },
    { id: 'pencil', icon: <FaPencilAlt size={18} />, label: 'Pencil' },
    { id: 'highlighter', icon: <FaHighlighter size={18} />, label: 'Highlighter' },
    { id: 'laser', icon: <FaMagic size={18} />, label: 'Laser Pointer' },
    { id: 'eraser', icon: <FaEraser size={18} />, label: 'Eraser' },
    { id: 'rect', icon: <FaSquare size={18} />, label: 'Rectangle' },
    { id: 'circle', icon: <FaCircle size={18} />, label: 'Circle' },
    { id: 'line', icon: <FaMinus size={18} />, label: 'Line' },
    { id: 'text', icon: <FaFont size={18} />, label: 'Text' },
  ];

  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500'
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed left-0 right-0 top-0 bg-black bg-opacity-50 z-[10000]"
        style={{ bottom: '120px' }}
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        className="fixed left-1/2 transform -translate-x-1/2 z-[10001] w-[95%] max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ 
          bottom: 'clamp(100px, 12vh, 140px)',
          height: 'min(800px, calc(100vh - 200px))'
        }}
      >
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0 bg-white">
          <h3 className="font-bold text-gray-800">Whiteboard</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            aria-label="Close whiteboard"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Sidebar Tools */}
          <div className="w-full md:w-16 h-auto md:h-full bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col flex-row items-center py-1 md:py-3 px-2 md:px-0 gap-1 z-20 overflow-x-auto md:overflow-y-auto no-scrollbar flex-shrink-0">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.label}
                className={`p-2 rounded-lg transition-all flex-shrink-0 relative group ${
                  tool === t.id 
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                    : 'text-gray-500 hover:bg-white hover:text-gray-700'
                }`}
              >
                {t.icon}
              </button>
            ))}
            
            <div className="hidden md:block w-8 h-px bg-gray-200 my-1 flex-shrink-0" />
            <div className="md:hidden w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />
            
            <button 
              onClick={() => setShowGrid(!showGrid)} 
              className={`p-2 rounded-lg transition-all flex-shrink-0 ${showGrid ? 'bg-blue-50 text-blue-500' : 'text-gray-500 hover:bg-white'}`}
              title="Toggle Grid"
            >
              <FaTh size={18} />
            </button>

            <button onClick={undo} className="p-2 text-gray-500 hover:bg-white rounded-lg flex-shrink-0" title="Undo">
              <FaUndo size={16} />
            </button>
            <button onClick={redo} className="p-2 text-gray-500 hover:bg-white rounded-lg flex-shrink-0" title="Redo">
              <FaRedo size={16} />
            </button>
            <button onClick={clearBoard} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0" title="Clear All">
              <FaTrash size={16} />
            </button>
            <button onClick={download} className="p-2 text-green-500 hover:bg-green-50 rounded-lg flex-shrink-0" title="Download Image">
              <FaDownload size={16} />
            </button>
          </div>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-white min-h-0">
            {/* Toolbar */}
            <div className="min-h-[48px] h-auto py-1 bg-white border-b border-gray-200 flex flex-wrap items-center px-4 md:px-6 gap-3 md:gap-6 z-20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden xs:block">Colors</span>
                <div className="flex gap-1 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                        color === c ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="w-4 h-4 md:w-5 md:h-5 p-0 border-0 bg-transparent cursor-pointer rounded-full"
                  />
                </div>
              </div>

              <div className="hidden sm:block h-6 w-px bg-gray-200" />

              <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[200px]">
                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden xs:block">Size</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] md:text-xs font-mono text-gray-500 w-6 text-right">{lineWidth}p</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                  {tool}
                </span>
              </div>
            </div>

            {/* Canvas Area */}
            <div 
              ref={canvasContainerRef}
              className="flex-1 relative cursor-crosshair overflow-hidden touch-none bg-gray-50 min-h-0"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute top-0 left-0 z-0 bg-white"
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 pointer-events-none z-10"
              />
            </div>

            {/* Page Navigation */}
            <div className="min-h-[44px] h-auto py-1.5 bg-white border-t border-gray-200 flex flex-wrap items-center justify-center px-4 md:px-6 gap-3 z-20 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100 scale-90 md:scale-100">
                <button 
                  onClick={() => currentPage > 0 && switchPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`p-1 rounded-md ${currentPage === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                >
                  <FaChevronLeft size={12} />
                </button>
                <div className="flex gap-1 overflow-x-auto max-w-[120px] md:max-w-[200px] no-scrollbar">
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => switchPage(i)}
                      className={`min-w-[22px] md:min-w-[26px] h-5 md:h-6 text-[10px] md:text-xs font-bold rounded-md transition-all ${
                        currentPage === i 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-500 hover:bg-white hover:text-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => currentPage < pages.length - 1 && switchPage(currentPage + 1)}
                  disabled={currentPage === pages.length - 1}
                  className={`p-1 rounded-md ${currentPage === pages.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
              <button 
                onClick={addPage}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] md:text-xs font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
              >
                <FaPlus size={10} /> Add
              </button>
              <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 md:ml-2">
                P:{pages.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Whiteboard;
