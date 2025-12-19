import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, X, ZoomIn, ZoomOut, Volume2, VolumeX, Palette, ImagePlus } from 'lucide-react';

export default function App() {
  const [userPhoto, setUserPhoto] = useState(null);
  const [activeAccessories, setActiveAccessories] = useState([]);
  const [customBg, setCustomBg] = useState(null);
  const [selectedBg, setSelectedBg] = useState('none');
  const [customColor, setCustomColor] = useState('#667eea');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgUpload, setShowBgUpload] = useState(false);
  const previewRef = useRef(null);
  const audioRef = useRef(null);

  const MUSIC_URL = '/music/background-music.mp3';

  const accessories = [
    { id: 1, name: 'RE Hat', image: '/accessories/re-hat.png', thumbnail: '/thumbnails/re-hat-thumb.png' },
    { id: 2, name: 'RE Chain', image: '/accessories/re-chain.png', thumbnail: '/thumbnails/re-chain-thumb.png' },
    { id: 3, name: 'RE Glasses', image: '/accessories/re-glasses.png', thumbnail: '/thumbnails/re-glasses-thumb.png' },
    { id: 4, name: 'RE Badge', image: '/accessories/re-badge.png', thumbnail: '/thumbnails/re-badge-thumb.png' },
    { id: 5, name: 'RE Bow Tie', image: '/accessories/re-bowtie.png', thumbnail: '/thumbnails/re-bowtie-thumb.png' },
    { id: 6, name: 'Christmas Hat', image: '/accessories/christmas-hat.png', thumbnail: '/thumbnails/christmas-hat-thumb.png' },
    { id: 7, name: 'Redacted', image: '/accessories/redacted.png', thumbnail: '/thumbnails/redacted-thumb.png' }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        setIsMusicPlaying(true);
      }
      setShowMusicPrompt(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUserPhoto(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBg(event.target.result);
        setSelectedBg('custom');
        setShowBgUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (color) => {
    setCustomColor(color);
    setSelectedBg('color');
  };

  const addAccessory = (accessory) => {
    const exists = activeAccessories.find(acc => acc.id === accessory.id);
    if (exists) return;

    const newAccessory = {
      ...accessory,
      instanceId: Date.now(),
      scale: 1,
      position: { x: 0, y: 0 },
      isDragging: false
    };
    setActiveAccessories([...activeAccessories, newAccessory]);
  };

  const removeAccessory = (instanceId) => {
    setActiveAccessories(activeAccessories.filter(acc => acc.instanceId !== instanceId));
  };

  const updateAccessoryScale = (instanceId, scale) => {
    setActiveAccessories(activeAccessories.map(acc => 
      acc.instanceId === instanceId ? { ...acc, scale: parseFloat(scale) } : acc
    ));
  };

  const handleAccessoryDragStart = (e, instanceId) => {
    e.preventDefault();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    setActiveAccessories(activeAccessories.map(acc => {
      if (acc.instanceId === instanceId) {
        return {
          ...acc,
          isDragging: true,
          dragStart: { x: clientX - acc.position.x, y: clientY - acc.position.y }
        };
      }
      return acc;
    }));
  };

  const handleAccessoryDragMove = (e, instanceId) => {
    e.preventDefault();
    const accessory = activeAccessories.find(acc => acc.instanceId === instanceId);
    if (!accessory || !accessory.isDragging) return;

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    setActiveAccessories(activeAccessories.map(acc => {
      if (acc.instanceId === instanceId) {
        return {
          ...acc,
          position: { x: clientX - acc.dragStart.x, y: clientY - acc.dragStart.y }
        };
      }
      return acc;
    }));
  };

  const handleAccessoryDragEnd = (instanceId) => {
    setActiveAccessories(activeAccessories.map(acc => 
      acc.instanceId === instanceId ? { ...acc, isDragging: false } : acc
    ));
  };

  // --- START OF CORRECTED downloadPFP FUNCTION (REFERENCE_SIZE updated to 800) ---
  const downloadPFP = () => {
    if (!userPhoto) {
      alert('Please upload a photo first!');
      return;
    }

    const canvas = document.createElement('canvas');
    const canvasSize = 1000;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    const previewSize = previewRef.current ? previewRef.current.offsetWidth : canvasSize;
    const scaleRatio = canvasSize / previewSize; 

    // 1. Draw Background
    const drawBackground = () => new Promise(resolve => {
      if (selectedBg === 'custom' && customBg) {
        const bgImg = new Image();
        bgImg.src = customBg;
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvasSize, canvasSize);
          resolve();
        };
        bgImg.onerror = () => resolve(); 
      } else if (selectedBg === 'color') {
        ctx.fillStyle = customColor;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        resolve();
      } else {
        resolve();
      }
    });

    // 2. Draw User Photo
    const drawUserPhoto = () => new Promise(resolve => {
      const img = new Image();
      img.src = userPhoto;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
        resolve();
      };
      img.onerror = () => {
        console.error("Failed to load user photo.");
        resolve(); 
      };
    });

    // 3. Draw Accessories
    const drawAccessories = () => {
      // --- REFERENCE SCALE FIX: INCREASED TO 800 PIXELS (80% of 1000x1000 canvas) ---
      const REFERENCE_SIZE = 800; 
      // --------------------------------------------------------------------------------

      const accessoryPromises = activeAccessories.map((accessory) => {
        return new Promise(resolve => {
          const accImg = new Image();
          accImg.crossOrigin = 'anonymous'; 
          accImg.src = accessory.image;
          
          accImg.onload = () => {
            ctx.save();
            
            // Calculate scale factors
            const initialScale = REFERENCE_SIZE / accImg.width;
            
            // Scale drag positions
            const dx = accessory.position.x * scaleRatio;
            const dy = accessory.position.y * scaleRatio;

            // Calculate center on 1000x1000 canvas
            const centerX = canvasSize / 2 + dx;
            const centerY = canvasSize / 2 + dy;

            ctx.translate(centerX, centerY);
            
            // Apply combined scale
            const finalScale = initialScale * accessory.scale;
            ctx.scale(finalScale, finalScale); 

            // Draw image centered on origin
            ctx.drawImage(accImg, -accImg.width / 2, -accImg.height / 2);
            
            ctx.restore(); 
            resolve(); 
          };
          
          accImg.onerror = () => {
            console.error(`Failed to load accessory image: ${accessory.image}`);
            resolve(); 
          };
        });
      });

      return Promise.all(accessoryPromises);
    };
    
    // 4. Sequence Execution and Final Download
    drawBackground()
      .then(drawUserPhoto)
      .then(drawAccessories)
      .then(() => {
        const link = document.createElement('a');
        link.download = 're-protocol-pfp.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch(err => {
        console.error("Error during PFP creation sequence:", err);
        alert("An error occurred during image finalization.");
      });
  };
  // --- END OF downloadPFP FUNCTION ---


  const getBackgroundStyle = () => {
    if (selectedBg === 'custom' && customBg) {
      return { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (selectedBg === 'color') {
      return { background: customColor };
    }
    return { background: '#374151' };
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-900 via-gray-900 to-purple-900 overflow-hidden">
      <audio ref={audioRef} src={MUSIC_URL} />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-800/50 backdrop-blur border-b border-purple-700">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">RE Protocol PFP Maker</h1>
          <p className="text-xs text-purple-200">Create your custom profile picture</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleMusic}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition"
          >
            {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={downloadPFP}
            disabled={!userPhoto}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
              userPhoto 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download size={20} />
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Music Prompt */}
      {showMusicPrompt && (
        <div className="absolute top-16 right-4 z-50 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs">
          <p className="text-sm mb-2">🎵 Want some music?</p>
          <div className="flex gap-2">
            <button onClick={toggleMusic} className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs">
              Play
            </button>
            <button onClick={() => setShowMusicPrompt(false)} className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs">
              No thanks
            </button>
          </div>
        </div>
      )}

      {/* Main Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div 
          ref={previewRef}
          className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl"
          style={getBackgroundStyle()}
        >
          {userPhoto ? (
            <img src={userPhoto} alt="Your photo" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Upload className="text-white/30 mb-4" size={64} />
              <p className="text-white/50 text-center text-lg">Upload your photo to start</p>
              <label className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg cursor-pointer transition">
                Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Accessories Layer */}
          {activeAccessories.map((accessory) => (
            <div
              key={accessory.instanceId}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: `translate(${accessory.position.x}px, ${accessory.position.y}px)` }}
            >
              <img
                src={accessory.image}
                alt={accessory.name}
                className="pointer-events-auto cursor-move touch-none select-none"
                style={{ transform: `scale(${accessory.scale})`, maxWidth: '300px', maxHeight: '300px' }}
                onMouseDown={(e) => handleAccessoryDragStart(e, accessory.instanceId)}
                onMouseMove={(e) => handleAccessoryDragMove(e, accessory.instanceId)}
                onMouseUp={() => handleAccessoryDragEnd(accessory.instanceId)}
                onMouseLeave={() => handleAccessoryDragEnd(accessory.instanceId)}
                onTouchStart={(e) => handleAccessoryDragStart(e, accessory.instanceId)}
                onTouchMove={(e) => handleAccessoryDragMove(e, accessory.instanceId)}
                onTouchEnd={() => handleAccessoryDragEnd(accessory.instanceId)}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-purple-800/50 backdrop-blur border-t border-purple-700 p-3 md:p-4">
        {/* Active Accessories Controls */}
        {activeAccessories.length > 0 && (
          <div className="mb-3 max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {activeAccessories.map((accessory) => (
                <div key={accessory.instanceId} className="flex-shrink-0 bg-purple-900/60 rounded-lg p-2 w-48">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-xs font-medium truncate">{accessory.name}</span>
                    <button onClick={() => removeAccessory(accessory.instanceId)} className="text-red-400 hover:text-red-300">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <ZoomOut className="text-purple-300 flex-shrink-0" size={14} />
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.1"
                      value={accessory.scale}
                      onChange={(e) => updateAccessoryScale(accessory.instanceId, e.target.value)}
                      className="flex-1"
                    />
                    <ZoomIn className="text-purple-300 flex-shrink-0" size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accessories Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
            {/* Upload Photo */}
            <label className="flex-shrink-0 w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center cursor-pointer transition">
              <Upload size={24} className="text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            {/* Divider */}
            <div className="h-12 w-px bg-purple-500 flex-shrink-0"></div>

            {/* Accessories */}
            {accessories.map((accessory) => (
              <button
                key={accessory.id}
                onClick={() => addAccessory(accessory)}
                className="flex-shrink-0 w-16 h-16 bg-purple-700 hover:bg-purple-600 rounded-lg p-2 transition group relative"
                title={accessory.name}
              >
                <img 
                  src={accessory.thumbnail} 
                  alt={accessory.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-white text-xs">${accessory.name}</span>`;
                  }}
                />
                {/* Hover Label */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-purple-900 text-white px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  {accessory.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}