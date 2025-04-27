// FindServicesPage.tsx
"use client";

import { useState } from 'react';
import MapComponent from './MapComponent';
import Navbar from './Navbar';
import { getServiceInfo } from './genai';

export default function FindServicesPage() {
  const [userInput, setUserInput] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [response, setResponse] = useState(''); // Add this back for API response

  // Handle chat submission
  const handleChatSubmit = async () => { 
    if (!userInput.trim()) return; // Don't send if the input is empty
    
    try {
      const result = await getServiceInfo(userInput);
      
      // Update both services AND response
      if (result) {
        if (result.services) {
          setServices(result.services);
        }
        if (result.text) {
          setResponse(result.text);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Optional: Add a small notification for errors
      alert("Sorry, I couldn't get the information right now.");
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
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{selectedService.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <p><strong>Type:</strong> {selectedService.type || 'Not specified'}</p>
              <p><strong>Location:</strong> {selectedService.location || 'Address not available'}</p>
              <p><strong>Contact:</strong> {selectedService.contact || 'Not available'}</p>
              {selectedService.hours && <p><strong>Hours:</strong> {selectedService.hours}</p>}
            </div>
            <div>
              {selectedService.lowCost !== undefined && 
                <p><strong>Low Cost:</strong> {selectedService.lowCost ? 'Yes' : 'No'}</p>}
              {selectedService.acceptsInsurance !== undefined && 
                <p><strong>Accepts Insurance:</strong> {selectedService.acceptsInsurance ? 'Yes' : 'No'}</p>}
              {selectedService.eligibility && 
                <p><strong>Eligibility:</strong> {selectedService.eligibility}</p>}
            </div>
          </div>
          {selectedService.services && selectedService.services.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>Services:</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        <button 
          onClick={handleChatSubmit}
          style={{
            padding: '14px 28px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease'
          }}
        >
          Find Services
        </button>
      </div>

      {/* Add back the API response display */}
      {response && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ffffff',
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
            color: '#000000',
            fontWeight: '400'
          }}>{response}</p>
        </div>
      )}
    </div>
  );
}
