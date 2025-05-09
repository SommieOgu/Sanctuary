"use client";
import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenerativeAI instance
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY, // Use your API Key from .env.local
});

// Predefined shelter data (can be expanded later)
export const services = [
    {
      name: "Community Health Clinic",
      type: "Pop-up Clinic",
      location: "123 Main St, Anytown, USA",
      contact: "(123) 456-7890",
      services: [
        "Basic health screenings",
        "Vaccinations",
        "Preventive care"
      ],
      lowCost: true,
      acceptsInsurance: true,
      hours: "Mon-Fri: 9am-5pm",
      eligibility: "Open to everyone",
      lat: 40.7128, 
      lng: -74.0060,
    },
    {
      name: "Memorial Medical Center",
      type: "Low-Cost Hospital",
      location: "456 Elm St, Somewhere, USA",
      contact: "(987) 654-3210",
      services: [
        "Emergency services",
        "Outpatient care",
        "Financial assistance programs"
      ],
      lowCost: true,
      acceptsInsurance: true,
      hours: "24/7",
      eligibility: "Sliding scale fees based on income",
      lat: 40.730610,
      lng: -73.935242,
    },
    {
      name: "Westside Transitional Housing",
      type: "Temporary Housing",
      location: "789 Oak Ave, Othertown, USA",
      contact: "(555) 123-4567",
      services: [
        "Short-term accommodations",
        "Case management",
        "Referral services"
      ],
      lowCost: true,
      acceptsInsurance: false,
      hours: "Office hours: 8am-8pm daily",
      eligibility: "Must meet income requirements",
      lat: 34.0522,
      lng: -118.2437,
    },
    {
      name: "Mindful Therapy Center",
      type: "Counseling Services",
      location: "101 Pine Rd, Anothercity, USA",
      contact: "(333) 222-1111",
      services: [
        "Individual therapy",
        "Group counseling",
        "Crisis intervention"
      ],
      lowCost: true,
      acceptsInsurance: true,
      hours: "Mon-Sat: 8am-7pm",
      eligibility: "Sliding scale fees available",
      lat: 41.8781,
      lng: -87.6298,
    },
    {
      name: "Mobile Health Van",
      type: "Pop-up Clinic",
      location: "Various locations - check schedule",
      contact: "(444) 777-8888",
      services: [
        "Basic health screenings",
        "STI testing",
        "Health education"
      ],
      lowCost: true,
      acceptsInsurance: false,
      hours: "Variable - see website for current schedule",
      eligibility: "No requirements, walk-ins welcome",
      lat: 29.7604,
      lng: -95.3698,
    }
  ];

// Function to interact with Gemini AI
export const getServiceInfo = async (userInput: string) => {
    try {
      // get location using simpler string methods
      const userInputLower = userInput.toLowerCase();
      let location = "";
      
      // Common location prefixes to check
      const locationPrefixes = ["near ", "in ", "around ", "close to ", "by "];
      
      // Check each prefix
      for (const prefix of locationPrefixes) {
        if (userInputLower.includes(prefix)) {
          // Find the start position of the prefix
          const startP = userInputLower.indexOf(prefix) + prefix.length;
          
          // Extract text after the prefix until a punctuation or end of string
          let endP = userInputLower.length;
          const punctuations = ["",",", ".", "!", "?", ";"];
          
          for (const punct of punctuations) {
            const punctPun = userInputLower.indexOf(punct, startP);
            if (punctPun !== -1 && punctPun < endP) {
              endP = punctPun;
            }
          }
          
          location = userInput.substring(startP, endP).trim();
          break; // Use the first location reference found
        }
      }
      
      // If API is not available, use fallback approach
      if (!ai) {
        console.warn("Google GenAI API key not set. Using fallback approach.");
        
        // Filter services based on simple keyword matching
        const filteredServices = services.filter(service => {
            return (
              (location && service.location.toLowerCase().includes(location.toLowerCase())) ||
              service.name.toLowerCase().includes(userInputLower) ||
              service.type.toLowerCase().includes(userInputLower) ||
              service.services.some(s => s.toLowerCase().includes(userInputLower))
            );
          });
          
          return {
            text: `Here are some services that might match your search: "${userInput}"`,
            services: filteredServices.length > 0 ? filteredServices : services,
          };
      }
      
      // Enhanced prompt with location context and request for specific details
      const promptWithLocation = location
      ? `User is looking for healthcare and support services near ${location}, specifically:
      1. Pop-up/mobile clinics
      2. Low-cost hospitals and medical centers
      3. Temporary housing options
      4. Mental health counseling services

      Please provide multiple options focusing on cost, insurance acceptance, hours, and available services. FOR EACH LOCATION, include the full address, latitude, and longitude in this exact format: 
      [ADDRESS: complete address] [LAT: latitude] [LNG: longitude]

      User query: ${userInput}`
      : `User is looking for healthcare and support services, specifically:
      1. Pop-up/mobile clinics
      2. Low-cost hospitals and medical centers
      3. Temporary housing options
      4. Mental health counseling services

      Please provide multiple options focusing on cost, insurance acceptance, hours, and available services. FOR EACH LOCATION, include the complete address, latitude, and longitude in this exact format: [ADDRESS: address] [LAT: latitude] [LNG: longitude]. 

      User query: ${userInput}`;
      
      // Keep original API call method
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Using Gemini 2.0 Flash
        contents: promptWithLocation,
      });
      
      // Get the text response
      let responseText = response.text || "";
      
      // Extract service data from the response
      let extractedServices = [];
      
      // First, use predefined services based on location or keywords
      let filteredServices = services;
      
      // If location is mentioned, try to filter existing services by it
      if (location) {
        filteredServices = services.filter(service => 
          service.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      // Also filter by other relevant keywords in the input
      const keywordFilters = ["medical", "food", "counseling", "emergency", "medical", "food", "shelter", "housing", "emergency", 
        "temporary", "assistance", "vaccination", 
        "healthcare", "clinic", "resources", "counseling", "therapy", "mental health", "low-cost", 
        "affordable", "free", "pop-up", "mobile", "support"
      ];
      
      const matchedKeywords = keywordFilters.filter(keyword => 
        userInputLower.includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        filteredServices = filteredServices.filter(service => {
          // Check if service matches any of the keywords
          return matchedKeywords.some(keyword => {
            if (keyword === "medical") return service.lowCost || service.type.toLowerCase().includes("medical");
            if (keyword === "counseling") return service.type.toLowerCase().includes("counsel") || service.services.some(s => s.toLowerCase().includes("counsel"));
            return true; // Include service for general keywords
          });
        });
      }
      
      // Then, try to extract service coordinates from the AI response
      // Look for patterns like [ADDRESS: address] [LAT: latitude] [LNG: longitude]
      const serviceRegex = /\[ADDRESS:\s*(.*?)\]\s*\[LAT:\s*([\d.-]+)\]\s*\[LNG:\s*([\d.-]+)\]/gi;
      let match;
      let regexServices = [];
      while ((match = serviceRegex.exec(responseText)) !== null) {
        const address = match[1].trim();
        const lat = parseFloat(match[2]);
        const lng = parseFloat(match[3]);
        
        console.log("Found service data:", { address, lat, lng });
        
        if (!isNaN(lat) && !isNaN(lng)) {
          regexServices.push({
            name: `Service at ${address.split(',')[0]}`,
            type: "Healthcare Service",
            location: address,
            contact: "Contact information not available",
            services: ["Healthcare services"],
            lowCost: true,
            acceptsInsurance: false,
            hours: "Hours not specified",
            eligibility: "Contact for eligibility",
            lat: lat,
            lng: lng
          });
        }
      }
      // Add a fallback to try to extract services from the text by scanning for keywords
      if (regexServices.length === 0) {
        // Try to identify service types in the response and assign default locations
        const serviceKeywords = [
          { keyword: "clinic", type: "Pop-up Clinic" },
          { keyword: "hospital", type: "Low-Cost Hospital" },
          { keyword: "housing", type: "Temporary Housing" },
          { keyword: "counsel", type: "Counseling Services" },
          { keyword: "therapy", type: "Therapy Services" },
          { keyword: "medical", type: "Medical Services" }
        ];
        
        // Create a copy of services to modify
        const defaultServices = [...services];
        
        // For each service type keyword, check if it appears in the response
        serviceKeywords.forEach(({ keyword, type }) => {
          if (responseText.toLowerCase().includes(keyword)) {
            // Find a service of this type in our default services
            const matchingService = defaultServices.find(s => 
              s.type.toLowerCase().includes(type.toLowerCase())
            );
            
            if (matchingService) {
              // Add to regex services to ensure it shows on map
              regexServices.push(matchingService);
            }
          }
        });
      }
      // Use a combination of filtered services and regex services
      extractedServices = [...filteredServices, ...regexServices];
      // Make sure we have unique services (no duplicates by coordinates)
      const serviceMap = new Map();
      extractedServices.forEach(service => {
        const key = `${service.lat}-${service.lng}`;
        serviceMap.set(key, service);
      });
      extractedServices = Array.from(serviceMap.values());
      // If no services found, use all predefined services as fallback
      if (extractedServices.length === 0) {
        console.log("No services found, using all predefined services");
        extractedServices = services;
        
        // If location is specified, simulate services at that location
        if (location) {
          console.log(`Adding simulated services near ${location}`);
          // Add a message to the response about using sample data
          responseText += `\n\nNote: Showing sample service locations since specific coordinates couldn't be determined for "${location}".`;
        }
      }
      
      // Return both the text response and the combined services
      return {
        text: responseText,
        services: extractedServices
      };
    } catch (error) {
      console.error("Error generating response:", error);
      
      // Enhanced error message
      let errorMessage = "Sorry, I couldn't get the information right now. Please try again later.";
      
      if (error && typeof error === 'object' && 'message' in error) {
        console.error("Error details:", (error as Error).message);
      }
      
      return {
        text: errorMessage,
        services: services,  // Return predefined services if there's an error
      };
    }
};
