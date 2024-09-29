import React, { useEffect, useState } from 'react';
import './Eventpage.css';
import EventCard from './EventCard'; // Adjust the import path if necessary

const Eventpage = ({ onRouteChange }) => {
    const [events, setEvents] = useState([]);
    const [images, setImages] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null); // New state to track selected event
    const userId = 25; // Assuming userId is 25 for this example
    const eventId = 3;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/events');
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5002/fetch_photo_Urls?Event_Id=${eventId}&User_Id=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }
            const data = await response.json();
            setImages(data.photo_urls); // Assuming data contains photo_urls array
            setSelectedEventId(eventId); // Set selected event ID
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const handleBack = () => {
        setImages([]); // Clear images
        setSelectedEventId(null); // Reset selected event ID
    };

    return (
        <div className="eventpage-container">
            <h1 className="eventpage-heading">My Events</h1>
            {selectedEventId ? (
                <div className="image-gallery">
                    <button className="back-button" onClick={handleBack}>Back to Events</button>
                    {images.map((url, index) => (
                        <img key={index} src={url} alt="Event" />
                    ))}
                </div>
            ) : (
                <div className="cards">
                    {events.map(event => (
                        <EventCard key={event.event_id} event={event} onClick={() => fetchImages(event.event_id)} />
                    ))}
                </div>
            )}
            <button className="create-event-button" onClick={() => onRouteChange('createEvent')}>Create Event</button>
        </div>
    );
};

export default Eventpage;
