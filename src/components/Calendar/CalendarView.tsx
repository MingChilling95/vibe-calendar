import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import MonthGrid from './MonthGrid';
import WeekGrid from './WeekGrid';
import EventModal from './EventModal';
import type { CalendarEvent, Tag } from '../../types';

type ViewMode = 'month' | 'week';

interface CalendarViewProps {
    events: CalendarEvent[];
    onEventsChange: (events: CalendarEvent[]) => void;
    onTodoDrop?: (todoId: string, date: Date) => void;
    onDeleteEvent?: (eventId: string) => void;
    tags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventsChange, onTodoDrop, onDeleteEvent, tags, onTagsChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewMode>(() => {
        return (localStorage.getItem('calendarView') as ViewMode) || 'month';
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        localStorage.setItem('calendarView', view);
    }, [view]);

    const handlePrev = () => {
        if (view === 'month') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            // TODO: Handle week navigation
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            // TODO: Handle week navigation
        }
    };

    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
        if (selectedEvent) {
            // Update existing
            onEventsChange(events.map(e => e.id === selectedEvent.id ? { ...e, ...newEvent } : e));
        } else {
            // Create new
            const event: CalendarEvent = {
                ...newEvent,
                id: crypto.randomUUID()
            };
            onEventsChange([...events, event]);
        }
    };

    const handleEventClick = (event: CalendarEvent) => {
        // Toggle completion on click, or open modal?
        // Let's open modal for editing if it's a click. 
        // We might want a separate way to toggle completion, e.g. checkbox in modal or small button.
        // For now, let's keep the toggle behavior but maybe add an edit button?
        // Actually, standard behavior is click to view/edit. Let's switch to that.
        setSelectedEvent(event);
        setSelectedDate(new Date(event.start));
        setIsModalOpen(true);
    };

    const handleEventMove = (eventId: string, newStart: Date) => {
        onEventsChange(events.map(event => {
            if (event.id === eventId) {
                const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
                return {
                    ...event,
                    start: newStart,
                    end: new Date(newStart.getTime() + duration)
                };
            }
            return event;
        }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Calendar Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600 }}>
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={handlePrev} style={{ padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                            &lt;
                        </button>
                        <button onClick={handleNext} style={{ padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                            &gt;
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} style={{ fontSize: '12px', padding: '4px 8px' }}>
                            Today
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', padding: '2px' }}>
                    <button
                        onClick={() => setView('month')}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            backgroundColor: view === 'month' ? 'var(--bg-primary)' : 'transparent',
                            boxShadow: view === 'month' ? 'var(--shadow-card)' : 'none',
                            fontSize: '14px'
                        }}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setView('week')}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            backgroundColor: view === 'week' ? 'var(--bg-primary)' : 'transparent',
                            boxShadow: view === 'week' ? 'var(--shadow-card)' : 'none',
                            fontSize: '14px',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Week
                    </button>
                </div>
            </div>

            {/* Calendar Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {view === 'month' ? (
                    <MonthGrid
                        currentDate={currentDate}
                        events={events}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                        onEventMove={handleEventMove}
                        onTodoDrop={onTodoDrop}
                        tags={tags}
                    />
                ) : (
                    <WeekGrid
                        currentDate={currentDate}
                        events={events}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                        onEventMove={handleEventMove}
                        onTodoDrop={onTodoDrop}
                        tags={tags}
                    />
                )}
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={onDeleteEvent}
                initialDate={selectedDate}
                existingEvent={selectedEvent}
                tags={tags}
                onTagsChange={onTagsChange}
            />
        </div>
    );
};

export default CalendarView;
