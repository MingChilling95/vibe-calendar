import { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import type { CalendarEvent } from '../../types';
import { format } from 'date-fns';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'>) => void;
    onDelete?: (eventId: string) => void;
    initialDate?: Date;
    existingEvent?: CalendarEvent;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, initialDate, existingEvent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [isAllDay, setIsAllDay] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowDeleteConfirm(false);
            if (existingEvent) {
                setTitle(existingEvent.title);
                setDescription(existingEvent.description || '');
                setStartTime(format(new Date(existingEvent.start), "yyyy-MM-dd'T'HH:mm"));
                setEndTime(format(new Date(existingEvent.end), "yyyy-MM-dd'T'HH:mm"));
                setIsAllDay(existingEvent.isAllDay || false);
                setIsCompleted(existingEvent.isCompleted || false);
            } else if (initialDate) {
                setTitle('');
                setDescription('');
                setIsAllDay(false);
                setIsCompleted(false);
                // Default to 9 AM on the selected date
                const start = new Date(initialDate);
                start.setHours(9, 0, 0, 0);
                setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));

                // Default to 10 AM
                const end = new Date(initialDate);
                end.setHours(10, 0, 0, 0);
                setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
            }
        }
    }, [isOpen, initialDate, existingEvent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title,
            description,
            start: new Date(startTime),
            end: new Date(endTime),
            isCompleted,
            isAllDay
        });
        onClose();
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (existingEvent && onDelete) {
            onDelete(existingEvent.id);
            onClose();
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    if (showDeleteConfirm) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Delete Event?">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                        Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
                        <button
                            type="button"
                            onClick={cancelDelete}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                color: 'var(--text-secondary)',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                backgroundColor: '#eb5757',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 500
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingEvent ? "Edit Event" : "Add Event"}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div>
                    <input
                        type="text"
                        placeholder="Event Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        autoFocus
                        style={{
                            fontSize: '24px',
                            fontWeight: 600,
                            width: '100%',
                            borderBottom: '1px solid var(--border-subtle)',
                            paddingBottom: '8px',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="checkbox"
                            id="isAllDay"
                            checked={isAllDay}
                            onChange={e => setIsAllDay(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <label htmlFor="isAllDay" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>All day</label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="checkbox"
                            id="isCompleted"
                            checked={isCompleted}
                            onChange={e => setIsCompleted(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <label htmlFor="isCompleted" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Completed</label>
                    </div>
                </div>

                {!isAllDay && (
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Start</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required={!isAllDay}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-subtle)',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>End</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                required={!isAllDay}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-subtle)',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>
                )}

                {isAllDay && (
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</label>
                            <input
                                type="date"
                                value={startTime.split('T')[0]}
                                onChange={e => {
                                    const date = e.target.value;
                                    setStartTime(`${date}T00:00`);
                                    setEndTime(`${date}T23:59`);
                                }}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-subtle)',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Description</label>
                    <textarea
                        placeholder="Add description..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '14px',
                            resize: 'none',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}
                    >
                        Cancel
                    </button>
                    {existingEvent && onDelete && (
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                color: '#eb5757',
                                fontSize: '14px',
                                fontWeight: 500
                            }}
                        >
                            Delete
                        </button>
                    )}
                    <button
                        type="submit"
                        style={{
                            padding: '8px 16px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--text-primary)',
                            color: 'var(--bg-primary)',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        Save
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EventModal;
