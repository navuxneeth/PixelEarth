import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingSource, MapLocation } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const searchLocation = async (
  query: string,
  userLocation?: { lat: number; lng: number }
): Promise<SearchResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Optimized for speed and basic grounding
    
    const toolConfig: any = {};
    if (userLocation) {
      toolConfig.retrievalConfig = {
        latLng: {
          latitude: userLocation.lat,
          longitude: userLocation.lng
        }
      };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `User query: "${query}". 
      If the user asks for a place, describe it briefly (max 2 sentences) in a retro "cyberpunk guide" persona.
      Provide the location.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: toolConfig,
        systemInstruction: "You are PixelEarth AI, a retro-futuristic navigation assistant. Keep responses short, punchy, and 8-bit themed.",
      },
    });

    const text = response.text || "No data found in the sector.";
    const candidates = response.candidates;
    const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks;

    let location: MapLocation | undefined;
    const sources: GroundingSource[] = [];

    if (groundingChunks) {
      for (const chunk of groundingChunks) {
        // Extract Web Sources
        if (chunk.web) {
            sources.push({
                title: chunk.web.title || "Unknown Source",
                uri: chunk.web.uri || "#"
            });
        }
        
        // Extract Map Location (Prioritize the first valid map chunk)
        if (chunk.googleMapsMetadata && !location) {
             // The structure can vary, but we look for place details
             // Note: The GenAI SDK simplifies this, but sometimes we just get the text grounded.
             // We need to rely on the chunks having metadata.
             // Actually, for Maps grounding, often the text contains the info, but let's check deep props.
             // If direct lat/lng isn't exposed in the chunk straightforwardly in the SDK type definition yet,
             // we might have to rely on the response logic.
             // However, usually `googleMapsMetadata` contains `place` info.
             // Let's assume we might need to parse or use the `groundingSupports` if available.
             
             // FALLBACK: If the SDK doesn't expose strict lat/lng in chunks yet (it's new),
             // we can ask the model to output JSON with coordinates if tools fail, 
             // BUT we must use the tool.
             
             // For this specific 'googleMaps' tool, the metadata usually contains place ID or center.
             // Let's try to find a source with a URI that is a google maps link, which is common.
        }
      }
    }

    // Since extracting raw lat/lng from grounding chunks can be complex/undocumented 
    // depending on the exact SDK version's response shape for 'googleMaps',
    // we will do a robust fallback: We perform a second "extraction" pass purely for coordinates 
    // if we didn't find them, OR we can rely on the fact that we are building a *map* app
    // and just trust the user might want to manually search if grounding fails.
    
    // HOWEVER, to make this "Magic", let's use a clever prompt trick in the SAME call?
    // No, tools + json mode is often mutually exclusive or tricky.
    
    // BETTER APPROACH:
    // The `googleMaps` tool is great for text answers. 
    // To get coordinates for the MAP component, we might need to extract them from the *text* if the tool injects them,
    // or parse the Place Source.
    
    // Let's try to extract from the `groundingChunks` specifically looking for `googleMapsMetadata`.
    // In many cases, `googleMapsMetadata` has `placeId`. We can't use Place ID in `pigeon-maps` easily without another API.
    
    // ALTERNATIVE:
    // We will ask Gemini to also output the estimated coordinates in the text if possible, 
    // or parse the returned snippet.
    
    // REFINED STRATEGY:
    // We will rely on the `googleMaps` tool for the "Info" and "Sources".
    // We will parse the response text for any coordinates if the model provides them, 
    // OR we can make a lightweight function call alongside or after to get coordinates.
    // Let's try to prompt for coordinates in the text output explicitly as a backup.
    
    const coordinateMatch = text.match(/LAT:\s*(-?\d+(\.\d+)?),\s*LNG:\s*(-?\d+(\.\d+)?)/i);
    if (coordinateMatch) {
        location = {
            lat: parseFloat(coordinateMatch[1]),
            lng: parseFloat(coordinateMatch[3]),
            zoom: 13
        };
    } else {
       // If standard grounding didn't give us explicit lat/lng in a way we can parse easily from metadata
       // (API limitation of current public docs for simple lat/lng extraction from chunks),
       // We'll interpret the response.
       
       // actually, let's try to find it in the `groundingMetadata.searchEntryPoint` or similar?
       // Let's assume for this demo, if we don't get coordinates, we might show a message.
       
       // WAIT! A better way for a Map App is to generic "Search" via a free geocoding lookup 
       // if Gemini is just text. But the prompt demands Gemini.
       
       // Let's add a "Geocoding" request to Gemini as a purely text-based fallback 
       // if the tool doesn't automate it.
       // We can ask Gemini: "Also print the coordinates in format |LAT:x, LNG:y| at the end."
    }
    
    // Final robust attempt for coordinates if the first pass failed to parse custom format
    if (!location) {
         const coordResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What are the latitude and longitude coordinates of "${query}"? 
            Return ONLY a JSON object: {"lat": number, "lng": number}.`,
            config: {
                responseMimeType: "application/json"
            }
         });
         try {
             const coords = JSON.parse(coordResponse.text);
             if (coords.lat && coords.lng) {
                 location = { lat: coords.lat, lng: coords.lng, zoom: 12 };
             }
         } catch (e) {
             console.error("Failed to fetch coordinates for map pan", e);
         }
    }

    return {
      text,
      location,
      sources
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return {
      text: "ERR: CONNECTION LOST. SATELLITE OFFLINE.",
      sources: []
    };
  }
};
