import React, { useState } from 'react';
import { MapPin, Search, X, Check, Compass } from 'lucide-react';

const POPULAR_LOCATIONS = [
  { name: 'Connaught Place', city: 'Central Delhi' },
  { name: 'Defence Colony', city: 'South Delhi' },
  { name: 'Hauz Khas Village', city: 'South Delhi' },
  { name: 'Cyber Hub', city: 'Gurgaon, Haryana' },
  { name: 'Greater Kailash 1', city: 'South Delhi' },
  { name: 'Khan Market', city: 'New Delhi' }
];

export default function LocationModal({ isOpen, onClose, onSelectLocation }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredLocations = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (locName, cityName) => {
    const fullLoc = `${locName}, ${cityName}`;
    localStorage.setItem('user_location', fullLoc);
    if (onSelectLocation) onSelectLocation(fullLoc);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <MapPin size={22} className="text-orange" />
            <h3 className="modal-title">Select Delivery Location</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Input */}
          <div className="location-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search area, landmark or street..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="location-input"
            />
            {searchTerm && (
              <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Current GPS Location button */}
          <button
            className="current-location-btn"
            onClick={() => handleSelect('Current Location', 'New Delhi')}
          >
            <Compass size={18} className="text-orange" />
            <div className="current-loc-text">
              <span className="current-loc-title">Use Current Location</span>
              <span className="current-loc-sub">Using GPS accuracy</span>
            </div>
          </button>

          <div className="locations-divider">
            <span>POPULAR SERVICEABLE AREAS</span>
          </div>

          {/* Locations List */}
          <div className="locations-list">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc, idx) => (
                <div
                  key={idx}
                  className="location-option-item"
                  onClick={() => handleSelect(loc.name, loc.city)}
                >
                  <div className="loc-pin-icon">
                    <MapPin size={16} />
                  </div>
                  <div className="loc-details">
                    <span className="loc-name">{loc.name}</span>
                    <span className="loc-city">{loc.city}</span>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="location-option-item"
                onClick={() => handleSelect(searchTerm, 'New Delhi')}
              >
                <div className="loc-pin-icon">
                  <MapPin size={16} />
                </div>
                <div className="loc-details">
                  <span className="loc-name">{searchTerm}</span>
                  <span className="loc-city">Deliver to this location</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

