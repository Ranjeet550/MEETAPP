import { useState } from 'react';
import { FaImage, FaEye, FaEyeSlash } from 'react-icons/fa';

const BackgroundEffects = ({ 
  onApplyBackground,
  onRemoveBackground,
  currentBackground = null,
  availableBackgrounds = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultBackgrounds = [
    { id: 'blur', name: 'Blur Background', type: 'blur', preview: null },
    { id: 'office', name: 'Office', type: 'image', preview: '/backgrounds/office.jpg' },
    { id: 'home', name: 'Home Office', type: 'image', preview: '/backgrounds/home.jpg' },
    { id: 'nature', name: 'Nature', type: 'image', preview: '/backgrounds/nature.jpg' },
    { id: 'abstract', name: 'Abstract', type: 'image', preview: '/backgrounds/abstract.jpg' }
  ];

  const backgrounds = availableBackgrounds.length > 0 ? availableBackgrounds : defaultBackgrounds;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
          currentBackground 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
        title="Background effects"
      >
        <FaImage className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      {/* Modal positioned above control bar */}
      {isOpen && (
       <>
         {/* Backdrop - Excludes bottom area where control bar is */}
         <div
           className="fixed left-0 right-0 top-0 bg-black bg-opacity-50 z-[9998]"
           style={{
             bottom: '120px' // Don't cover the control bar area (control bar is at bottom-3 + height ~80px)
           }}
           onClick={() => setIsOpen(false)}
         />
          
         {/* Modal Panel - Positioned above control bar */}
         <div
           className="fixed left-1/2 transform -translate-x-1/2 z-[9999] w-11/12 max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
           style={{
             bottom: 'clamp(100px, 12vh, 140px)', // Responsive: well above control bar on all screen sizes
             maxHeight: 'min(400px, calc(100vh - 200px))' // Responsive max height
           }}
         >
           <div className="p-4 border-b flex items-center justify-between flex-shrink-0 bg-white">
             <h3 className="font-semibold text-gray-800">Background Effects</h3>
             <button
               onClick={() => setIsOpen(false)}
               className="text-gray-500 hover:text-gray-700 text-xl font-bold leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
               aria-label="Close background effects"
             >
               ×
             </button>
           </div>
           
           <div className="p-4 overflow-y-auto flex-1 bg-white">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {/* No Background Option */}
               <button
                 onClick={() => {
                   onRemoveBackground?.();
                   setIsOpen(false);
                 }}
                 className={`aspect-video rounded-lg border-2 flex items-center justify-center transition-colors ${
                   !currentBackground
                     ? 'border-blue-500 bg-blue-50'
                     : 'border-gray-200 hover:border-gray-300'
                 }`}
               >
                 <div className="text-center">
                   <FaEyeSlash className="mx-auto mb-1 text-gray-500" />
                   <div className="text-xs text-gray-600">None</div>
                 </div>
               </button>

               {/* Background Options */}
               {backgrounds.map((bg) => (
                 <button
                   key={bg.id}
                   onClick={() => {
                     onApplyBackground?.(bg);
                     setIsOpen(false);
                   }}
                   className={`aspect-video rounded-lg border-2 overflow-hidden transition-colors ${
                     currentBackground?.id === bg.id
                       ? 'border-blue-500'
                       : 'border-gray-200 hover:border-gray-300'
                   }`}
                 >
                   {bg.type === 'blur' ? (
                     <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                       <div className="text-center">
                         <FaEye className="mx-auto mb-1 text-gray-500" />
                         <div className="text-xs text-gray-600">Blur</div>
                       </div>
                     </div>
                   ) : (
                     <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                       <div className="text-center">
                         <FaImage className="mx-auto mb-1 text-gray-500" />
                         <div className="text-xs text-gray-600">{bg.name}</div>
                       </div>
                     </div>
                   )}
                 </button>
               ))}
             </div>
             <div className="text-xs text-gray-500 text-center mt-3">
               Background effects require a modern browser with WebGL support
             </div>
           </div>
          </div>
        </>
      )}
    </>
  );
};

export default BackgroundEffects;