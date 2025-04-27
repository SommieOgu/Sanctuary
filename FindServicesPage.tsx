//src/app/find-shelter/FindServicesPage.tsx
"use client";

import { useState } from 'react';
import MapComponent from '../MapComponent';
import Navbar from '../Navbar';
import { getServiceInfo } from '../genai';

export default function FindServicesPage() {
  const [userInput, setUserInput] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [response, setResponse] = useState(''); // Add this back for API response
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Handle chat submission
  const handleChatSubmit = async () => { 
    if (!userInput.trim()) return; // Don't send if the input is empty
    
    // Set loading state
    setIsLoading(true);
    setResponse("Loading...");
    
    try {
      console.log("Sending query to gemini-2.0-flash:", userInput);
      const result = await getServiceInfo(userInput);
      
      // Update both services AND response
      if (result) {
        if (result.services) {
          console.log("Got services:", result.services.length);
          setServices(result.services);
        }
        if (result.text) {
          console.log("Got response text");
          setResponse(result.text);
        }
      } else {
        setResponse("No results found. Please try a different query.");
      }
    } catch (error) {
      console.error('Error in handleChatSubmit:', error);
      
      // Handle unknown type error
      let errorMessage = 'An unknown error occurred';
      
      // Check if error is an object with message property
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as Error).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // More informative error message
      setResponse(`Sorry, I couldn't get the information right now. Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle marker click
  const handleMarkerClick = (service: any) => {
    setSelectedService(service);
  };

  return (
    <div style={{ 
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '28px',
        marginBottom: '20px',
        color: '#333'
      }}>
        Find Healthcare & Support Services
      </h1>
      
      <div style={{ marginBottom: '30px' }}>
        <MapComponent 
          services={services} 
          onMarkerClick={handleMarkerClick}
        />
      </div>
      
      {/* Display selected service information */}
      {selectedService && (
        <div style={{ 
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: '#f8f8f8', // Changed to light gray
          borderRadius: '5px',
          border: '1px solid #ccc',
          boxShadow: 'none'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            marginBottom: '15px',
            color: '#204969', // Darker color for heading
            fontWeight: '600'
          }}>{selectedService.name}</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            color: '#000000', // Darker text color for better readability
            fontWeight: '400'
          }}>
            <div>
              <p><strong style={{ color: '#204969' }}>Type:</strong> {selectedService.type || 'Not specified'}</p>
              <p><strong style={{ color: '#204969' }}>Location:</strong> {selectedService.location || 'Address not available'}</p>
              <p><strong style={{ color: '#204969' }}>Contact:</strong> {selectedService.contact || 'Not available'}</p>
              {selectedService.hours && <p><strong style={{ color: '#204969' }}>Hours:</strong> {selectedService.hours}</p>}
            </div>
            <div>
              {selectedService.lowCost !== undefined && 
                <p><strong style={{ color: '#204969' }}>Low Cost:</strong> {selectedService.lowCost ? 'Yes' : 'No'}</p>}
              {selectedService.acceptsInsurance !== undefined && 
                <p><strong style={{ color: '#204969' }}>Accepts Insurance:</strong> {selectedService.acceptsInsurance ? 'Yes' : 'No'}</p>}
              {selectedService.eligibility && 
                <p><strong style={{ color: '#204969' }}>Eligibility:</strong> {selectedService.eligibility}</p>}
            </div>
          </div>
          
          {selectedService.services && selectedService.services.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <strong style={{ color: '#204969' }}>Services:</strong>
              <ul style={{ 
                marginTop: '8px', 
                paddingLeft: '25px',
                color: '#000000', // Darker text color
                lineHeight: '1.6' // Slightly increased line height for better readability
              }}>
                {selectedService.services.map((service: string, idx: number) => (
                  <li key={idx}>{service}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '40px' }}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your question here, like 'Find clinics near San Francisco' or 'Where can I find low-cost medical care and temporary housing?'"
          style={{ 
            width: '100%', 
            minHeight: '150px',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontFamily: 'inherit',
            fontSize: '16px',
            boxShadow: 'none' // Removed shadow
          }}
        />
        <button 
          onClick={handleChatSubmit}
          disabled={isLoading}
          style={{
            padding: '14px 28px',
            backgroundColor: isLoading ? '#a0a0a0' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: 'none', // Removed shadow
            transition: 'all 0.2s ease'
          }}
        >
          {isLoading ? 'Searching...' : 'Find Services'}
        </button>
      </div>

      {/* API response display */}
      {response && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f8f8', // Changed to light gray
          borderRadius: '5px',
          width: '100%', 
          minHeight: '120px', 
          border: '1px solid #ccc',
          fontFamily: 'inherit',
          fontSize: '16px',
          whiteSpace: 'pre-line',
          lineHeight: '1.5',
          overflowWrap: 'break-word',
          boxShadow: 'none'
        }}>
          <p style={{ 
            margin: '0',
            color: '#000000', // Darker color for better readability
            fontWeight: '400'
          }}>{response}</p>
        </div>
      )}
    </div>
  );
}
