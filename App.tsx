import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Globe, Loader2, Navigation, Info } from 'lucide-react';
import { PixelMap } from './components/PixelMap';
import { ScanlineCard } from './components/ScanlineCard';
import { RetroButton } from './components/RetroButton';
import { searchLocation } from './services/geminiService';
import { MapLocation, SearchResult } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState<[number, number]>([34.0522, -118.2437]); // Default LA
  const [zoom, setZoom] = useState(11);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  // Initialize: Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          setZoom(13);
        },
        (err) => console.error("Geo error:", err)
      );
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    // Call Gemini
    const searchRes = await searchLocation(query, { lat: center[0], lng: center[1] });
    
    setResult(searchRes);
    if (searchRes.location) {
      setCenter([searchRes.location.lat, searchRes.location.lng]);
      setZoom(searchRes.location.zoom || 14);
    }
    setLoading(false);
    setShowInfo(true);
  };

  const handleMapChange = useCallback(({ center, zoom }: { center: [number, number]; zoom: number }) => {
    setCenter(center);
    setZoom(zoom);
  }, []);

  const zoomIn = () => setZoom(z => Math.min(z + 1, 18));
  const zoomOut = () => setZoom(z => Math.max(z - 1, 1));

  return (
    <div className="flex flex-col h-screen w-full relative">
      
      {/* Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-40 p-4 pointer-events-none flex justify-between items-start">
        <div className="pointer-events-auto">
          <ScanlineCard className="w-full max-w-md">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-6 h-6 text-[#33ff00]" />
                    <h1 className="text-3xl font-bold tracking-widest text-shadow-retro">PixelEarth</h1>
                </div>
                
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SEARCH SECTOR..."
                        className="bg-black border-2 border-[#33ff00] text-[#33ff00] px-3 py-2 outline-none placeholder-[#33ff00]/50 w-full font-xl uppercase"
                    />
                    <RetroButton type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                    </RetroButton>
                </form>
            </div>
          </ScanlineCard>
        </div>

        {/* Coordinates Display */}
        <div className="hidden md:block pointer-events-auto">
             <ScanlineCard className="min-w-[200px]">
                <div className="text-right text-sm">
                    <p>LAT: {center[0].toFixed(4)}</p>
                    <p>LNG: {center[1].toFixed(4)}</p>
                    <p>ZM: {Math.round(zoom)}</p>
                </div>
             </ScanlineCard>
        </div>
      </header>

      {/* Main Map View */}
      <main className="flex-1 w-full h-full relative z-0">
        <PixelMap 
            center={center} 
            zoom={zoom} 
            onBoundsChanged={handleMapChange}
            markers={result?.location ? [result.location] : []}
        />
      </main>

      {/* Search Result Overlay */}
      {result && showInfo && (
        <div className="absolute top-32 left-4 z-30 max-w-md pointer-events-auto">
           <ScanlineCard title="Analysis Result" className="animate-in slide-in-from-left fade-in duration-300">
               <div className="space-y-3">
                   <p className="text-xl leading-tight border-l-4 border-[#33ff00] pl-3 py-1 bg-[#33ff00]/10">
                       {result.text}
                   </p>
                   
                   {result.sources && result.sources.length > 0 && (
                       <div className="mt-4 text-sm">
                           <p className="opacity-70 mb-1 border-b border-[#33ff00]/50 pb-1">DATA SOURCES:</p>
                           <ul className="space-y-1">
                               {result.sources.slice(0, 3).map((s, i) => (
                                   <li key={i} className="truncate">
                                       <a href={s.uri} target="_blank" rel="noopener noreferrer" className="hover:bg-[#33ff00] hover:text-black px-1 transition-colors">
                                           [{i + 1}] {s.title}
                                       </a>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )}

                   <div className="flex justify-end pt-2">
                       <RetroButton variant="secondary" onClick={() => setShowInfo(false)} className="text-sm py-1">
                           ACKNOWLEDGE
                       </RetroButton>
                   </div>
               </div>
           </ScanlineCard>
        </div>
      )}

      {/* Reopen Info Button (if hidden but result exists) */}
      {result && !showInfo && (
         <div className="absolute top-32 left-4 z-30 pointer-events-auto">
             <RetroButton onClick={() => setShowInfo(true)}>
                 <Info className="w-5 h-5" />
             </RetroButton>
         </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-8 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
        <RetroButton onClick={zoomIn} className="w-12 h-12 text-2xl">+</RetroButton>
        <RetroButton onClick={zoomOut} className="w-12 h-12 text-2xl">-</RetroButton>
        <div className="h-4" />
        <RetroButton onClick={() => {
             if (navigator.geolocation) {
                 navigator.geolocation.getCurrentPosition(p => {
                     setCenter([p.coords.latitude, p.coords.longitude]);
                     setZoom(15);
                 });
             }
        }} className="w-12 h-12 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
        </RetroButton>
      </div>

      {/* Footer / Status */}
      <div className="absolute bottom-0 left-0 right-0 bg-black border-t-2 border-[#33ff00] p-1 px-4 z-50 text-xs flex justify-between items-center opacity-80 pointer-events-none">
         <span>SYS.STATUS: ONLINE</span>
         <span className="animate-pulse">CONNECTED TO GEMINI NETWORK</span>
         <span>VER 1.0.0</span>
      </div>
    </div>
  );
}

export default App;
