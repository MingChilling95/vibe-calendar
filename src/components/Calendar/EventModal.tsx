import { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import type { CalendarEvent, Tag } from '../../types';
import { format } from 'date-fns';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'>) => void;
    onDelete?: (eventId: string) => void;
    initialDate?: Date;
    existingEvent?: CalendarEvent;
    tags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, onDelete, initialDate, existingEvent, tags, onTagsChange }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [isAllDay, setIsAllDay] = useState(false);

    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

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
                setIsCompleted(existingEvent.isCompleted || false);
                setSelectedTagIds(existingEvent.tagIds || []);
            } else if (initialDate) {
                setTitle('');
                setDescription('');
                setIsAllDay(false);

                setIsCompleted(false);
                setIsCompleted(false);
                setSelectedTagIds([]);
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

        // Add pending tag if exists
        let finalTagIds = [...selectedTagIds];
        if (tagInput.trim()) {
            const tagName = tagInput.trim();
            const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());

            if (existingTag) {
                if (!finalTagIds.includes(existingTag.id)) {
                    finalTagIds.push(existingTag.id);
                }
            } else {
                // Create new tag
                const newTag: Tag = {
                    id: crypto.randomUUID(),
                    name: tagName,
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
                };
                onTagsChange([...tags, newTag]);
                finalTagIds.push(newTag.id);
            }
        }

        onSave({
            title,
            description,
            start: new Date(startTime),
            end: new Date(endTime),
            isCompleted,
            isAllDay,
            tagIds: finalTagIds
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

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const tagName = tagInput.trim();

            // Check if tag exists
            const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());

            if (existingTag) {
                if (!selectedTagIds.includes(existingTag.id)) {
                    setSelectedTagIds([...selectedTagIds, existingTag.id]);
                }
            } else {
                // Create new tag
                const newTag: Tag = {
                    id: crypto.randomUUID(),
                    name: tagName,
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
                };
                onTagsChange([...tags, newTag]);
                setSelectedTagIds([...selectedTagIds, newTag.id]);
            }
            setTagInput('');
            setShowSuggestions(false);
        }
    };

    const selectTag = (tag: Tag) => {
        if (!selectedTagIds.includes(tag.id)) {
            setSelectedTagIds([...selectedTagIds, tag.id]);
        }
        setTagInput('');
        setShowSuggestions(false);
    };

    const removeTag = (tagIdToRemove: string) => {
        setSelectedTagIds(selectedTagIds.filter(id => id !== tagIdToRemove));
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTagIds.includes(tag.id)
    );

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

                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tags</label>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '8px',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        minHeight: '42px',
                        position: 'relative'
                    }}>
                        {selectedTagIds.map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <span key={tag.id} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    backgroundColor: tag.color + '20', // 20% opacity
                                    fontSize: '12px',
                                    color: tag.color,
                                    border: `1px solid ${tag.color}40`
                                }}>
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag.id)}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: '14px',
                                            color: 'inherit',
                                            display: 'flex',
                                            alignItems: 'center',
                                            opacity: 0.7
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Add tag..."
                                value={tagInput}
                                onChange={e => {
                                    setTagInput(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyDown={handleAddTag}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)',
                                    background: 'transparent',
                                    width: '100%',
                                    minWidth: '60px'
                                }}
                            />
                            {showSuggestions && tagInput && filteredTags.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '4px',
                                    marginTop: '4px',
                                    zIndex: 100,
                                    boxShadow: 'var(--shadow-card)',
                                    maxHeight: '150px',
                                    overflowY: 'auto'
                                }}>
                                    {filteredTags.map(tag => (
                                        <div
                                            key={tag.id}
                                            onClick={() => selectTag(tag)}
                                            style={{
                                                padding: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: 'var(--text-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: tag.color }} />
                                            {tag.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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
