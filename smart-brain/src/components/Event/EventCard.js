import React from 'react';
import './Eventpage.css';

const EventCard = ({ event, onClick }) => {
    return (
        <div className="event-card" onClick={() => onClick(event.event_id)}>
            <h3>{event.event_name}</h3>
            <p>Owner : {event.event_owner}</p>
            <p>Dated : {event.created_on}</p>
        </div>
    );
};

export default EventCard;
