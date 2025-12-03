import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isToday,
    addHours,
    startOfDay,
    endOfDay,
    isWithinInterval
} from 'date-fns';
import type { CalendarEvent, Tag } from '../../types';

interface WeekGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    onEventMove: (eventId: string, newStart: Date) => void;
    onTodoDrop?: (todoId: string, date: Date) => void;
    tags: Tag[];
}

const WeekGrid: React.FC<WeekGridProps> = ({ currentDate, events, onDateClick, onEventClick, onEventMove, onTodoDrop, tags }) => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(weekStart);

    const days = eachDayOfInterval({
        start: weekStart,
        end: weekEnd,
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const handleDragStart = (e: React.DragEvent, eventId: string) => {
        e.dataTransfer.setData('text/plain', eventId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetDate: Date, hour: number) => {
        e.preventDefault();
        const todoId = e.dataTransfer.getData('todo-id');

        if (todoId && onTodoDrop) {
            const dropDate = new Date(targetDate);
            dropDate.setHours(hour);
            onTodoDrop(todoId, dropDate);
            return;
        }

        const eventId = e.dataTransfer.getData('text/plain');
        if (eventId) {
            const newStart = new Date(targetDate);
            newStart.setHours(hour, 0, 0, 0);
            onEventMove(eventId, newStart);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
            {/* Header (Days) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '60px repeat(7, 1fr)',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                flexShrink: 0
            }}>
                <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                    All Day
                </div>

                {days.map(day => {
                    const isDayToday = isToday(day);
                    const dayAllDayEvents = events.filter(event =>
                        event.isAllDay && isWithinInterval(day, { start: startOfDay(new Date(event.start)), end: endOfDay(new Date(event.end)) })
                    );

                    return (
                        <div key={day.toString()} style={{
                            padding: '8px',
                            textAlign: 'center',
                            borderRight: '1px solid var(--border-subtle)',
                            backgroundColor: isDayToday ? 'var(--bg-primary)' : 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{ fontSize: '12px', color: isDayToday ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                {format(day, 'EEE')}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: isDayToday ? 700 : 400,
                                color: isDayToday ? 'white' : 'var(--text-primary)',
                                backgroundColor: isDayToday ? '#eb5757' : 'transparent',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                lineHeight: '24px',
                                margin: '0 auto'
                            }}>
                                {format(day, 'd')}
                            </div>

                            {/* All Day Events List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                                {dayAllDayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        style={{
                                            backgroundColor: event.isCompleted ? 'var(--bg-tertiary)' : (event.color || 'var(--color-blue)'),
                                            color: event.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                            fontSize: '10px',
                                            padding: '2px 4px',
                                            borderRadius: '2px',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            cursor: 'pointer',
                                            textDecoration: event.isCompleted ? 'line-through' : 'none'
                                        }}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Time Grid */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                {/* Time Labels */}
                <div style={{ borderRight: '1px solid var(--border-subtle)' }}>
                    {hours.map(hour => (
                        <div key={hour} style={{
                            height: '60px',
                            borderBottom: '1px solid var(--border-subtle)',
                            fontSize: '10px',
                            color: 'var(--text-tertiary)',
                            textAlign: 'right',
                            paddingRight: '8px',
                            position: 'relative',
                            top: '-6px'
                        }}>
                            {hour === 0 ? '' : format(addHours(startOfDay(new Date()), hour), 'h a')}
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                {days.map((day, dayIdx) => {
                    // Filter events for this day (excluding all-day events)
                    const dayEvents = events.filter(event => {
                        if (event.isAllDay) return false;
                        const eventStart = startOfDay(new Date(event.start));
                        const eventEnd = endOfDay(new Date(event.end));
                        return isWithinInterval(day, { start: eventStart, end: eventEnd });
                    });

                    // Calculate layout for overlapping events
                    const sortedEvents = dayEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
                    const eventPositions: { [key: string]: { width: number, left: number } } = {};

                    // Simple greedy algorithm for columns
                    // Note: A more robust graph coloring algorithm could be used for complex overlaps,
                    // but this is sufficient for basic side-by-side requirements.
                    const columns: CalendarEvent[][] = [];

                    sortedEvents.forEach(event => {
                        let placed = false;
                        for (let i = 0; i < columns.length; i++) {
                            const column = columns[i];
                            const lastEventInColumn = column[column.length - 1];
                            // Check if this event overlaps with the last event in this column
                            // We only need to check the last one because we sorted by start time
                            if (new Date(event.start) >= new Date(lastEventInColumn.end)) {
                                column.push(event);
                                placed = true;
                                break;
                            }
                        }
                        if (!placed) {
                            columns.push([event]);
                        }
                    });

                    // Assign positions
                    const totalColumns = columns.length;
                    columns.forEach((column, colIndex) => {
                        column.forEach(event => {
                            eventPositions[event.id] = {
                                width: 100 / totalColumns,
                                left: (colIndex / totalColumns) * 100
                            };
                        });
                    });

                    return (
                        <div key={day.toString()} style={{
                            borderRight: (dayIdx + 1) % 7 === 0 ? 'none' : '1px solid var(--border-subtle)',
                            position: 'relative'
                        }}>
                            {hours.map(hour => (
                                <div
                                    key={hour}
                                    onClick={() => {
                                        const clickDate = new Date(day);
                                        clickDate.setHours(hour);
                                        onDateClick(clickDate);
                                    }}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day, hour)}
                                    style={{
                                        height: '60px',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        position: 'relative',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}

                            {/* Render Events Absolute */}
                            {dayEvents.map(event => {
                                const eventStart = new Date(event.start);
                                const eventEnd = new Date(event.end);
                                const dayStart = startOfDay(day);
                                const dayEnd = endOfDay(day);

                                // Clamp start/end to current day
                                const displayStart = eventStart < dayStart ? dayStart : eventStart;
                                const displayEnd = eventEnd > dayEnd ? dayEnd : eventEnd;

                                const startHour = displayStart.getHours() + displayStart.getMinutes() / 60;
                                const endHour = displayEnd.getHours() + displayEnd.getMinutes() / 60;
                                // Handle case where end is exactly midnight of next day (which is 0:00 of next day, but effectively 24:00 of this day)
                                const effectiveEndHour = (displayEnd.getTime() === dayEnd.getTime() + 1) ? 24 : endHour;

                                const duration = Math.max(effectiveEndHour - startHour, 0.5); // Min 30 mins visual
                                const position = eventPositions[event.id] || { width: 100, left: 0 };

                                return (
                                    <div
                                        key={event.id}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, event.id)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: `${startHour * 60}px`,
                                            height: `${duration * 60}px`,
                                            left: `${position.left}%`,
                                            width: `${position.width}%`,
                                            backgroundColor: event.isCompleted ? 'var(--bg-tertiary)' : (event.color || 'var(--color-blue)'),
                                            color: event.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                            borderRadius: '4px',
                                            padding: '2px 4px',
                                            fontSize: '11px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            zIndex: 10,
                                            textDecoration: event.isCompleted ? 'line-through' : 'none',
                                            cursor: 'grab',
                                            boxSizing: 'border-box' // Ensure padding/border doesn't break width
                                        }}
                                    >
                                        {event.title}
                                        {event.tagIds && event.tagIds.length > 0 && (
                                            <div style={{ display: 'flex', gap: '2px', marginTop: '2px', flexWrap: 'wrap' }}>
                                                {event.tagIds.map(tagId => {
                                                    const tag = tags.find(t => t.id === tagId);
                                                    if (!tag) return null;
                                                    return (
                                                        <span key={tag.id} style={{
                                                            fontSize: '9px',
                                                            padding: '0 2px',
                                                            borderRadius: '2px',
                                                            backgroundColor: tag.color + '40',
                                                            color: 'inherit',
                                                            border: '1px solid rgba(0,0,0,0.1)'
                                                        }}>
                                                            {tag.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekGrid;
