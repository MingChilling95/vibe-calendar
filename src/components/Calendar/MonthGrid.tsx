import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isToday,
    isWithinInterval,
    startOfDay,
    endOfDay
} from 'date-fns';
import type { CalendarEvent } from '../../types';

interface MonthGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    onEventMove: (eventId: string, newStart: Date) => void;
    onTodoDrop?: (todoId: string, date: Date) => void;
}

const MonthGrid: React.FC<MonthGridProps> = ({ currentDate, events, onDateClick, onEventClick, onEventMove, onTodoDrop }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleDragStart = (e: React.DragEvent, eventId: string) => {
        e.dataTransfer.setData('text/plain', eventId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetDate: Date) => {
        e.preventDefault();
        const todoId = e.dataTransfer.getData('todo-id');

        if (todoId && onTodoDrop) {
            onTodoDrop(todoId, targetDate);
            return;
        }

        const eventId = e.dataTransfer.getData('text/plain');
        if (eventId) {
            const originalEvent = events.find(ev => ev.id === eventId);
            if (originalEvent) {
                const originalStart = new Date(originalEvent.start);
                const newStart = new Date(targetDate);
                newStart.setHours(originalStart.getHours(), originalStart.getMinutes());
                onEventMove(eventId, newStart);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
            {/* Weekday Headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)'
            }}>
                {weekDays.map(day => (
                    <div key={day} style={{
                        padding: '8px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)'
                    }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridAutoRows: '1fr',
                flex: 1
            }}>
                {days.map((day, dayIdx) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);
                    const dayEvents = events.filter(event => {
                        const eventStart = startOfDay(new Date(event.start));
                        const eventEnd = endOfDay(new Date(event.end));
                        return isWithinInterval(day, { start: eventStart, end: eventEnd });
                    });

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick(day)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day)}
                            style={{
                                borderRight: (dayIdx + 1) % 7 === 0 ? 'none' : '1px solid var(--border-subtle)',
                                borderBottom: '1px solid var(--border-subtle)',
                                padding: '4px',
                                backgroundColor: isCurrentMonth ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                                opacity: isCurrentMonth ? 1 : 0.5,
                                position: 'relative',
                                cursor: 'pointer',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: isDayToday ? 600 : 400,
                                    color: isDayToday ? 'white' : 'var(--text-secondary)',
                                    backgroundColor: isDayToday ? '#eb5757' : 'transparent',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    display: 'inline-block'
                                }}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Events List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, event.id)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        style={{
                                            fontSize: '11px',
                                            padding: '2px 4px',
                                            borderRadius: '2px',
                                            backgroundColor: event.isCompleted ? 'var(--bg-tertiary)' : (event.color || 'var(--color-blue)'),
                                            color: event.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                                            textDecoration: event.isCompleted ? 'line-through' : 'none',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            cursor: 'grab'
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
        </div>
    );
};

export default MonthGrid;
