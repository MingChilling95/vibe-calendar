import { useState } from 'react';
import { isSameDay, format } from 'date-fns';
import type { Todo, CalendarEvent } from '../../types';

import MonthGrid from '../Calendar/MonthGrid';
import { addMonths, subMonths } from 'date-fns';

interface TodoListProps {
    todos: Todo[];
    onTodosChange: (todos: Todo[]) => void;
    events: CalendarEvent[];
    onEventsChange: (events: CalendarEvent[]) => void;
    showMiniCalendar?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onTodosChange, events, onEventsChange, showMiniCalendar = true }) => {
    const [inputValue, setInputValue] = useState('');
    const [calendarDate, setCalendarDate] = useState(new Date());

    const handleAddTodo = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            const newTodo: Todo = {
                id: crypto.randomUUID(),
                content: inputValue.trim(),
                isCompleted: false,
                createdAt: new Date()
            };
            onTodosChange([...todos, newTodo]);
            setInputValue('');
        }
    };

    const toggleTodo = (id: string) => {
        onTodosChange(todos.map(todo =>
            todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
        ));
    };

    const toggleEvent = (id: string) => {
        onEventsChange(events.map(event =>
            event.id === id ? { ...event, isCompleted: !event.isCompleted } : event
        ));
    };

    const deleteTodo = (id: string) => {
        onTodosChange(todos.filter(todo => todo.id !== id));
    };

    const handleDragStart = (e: React.DragEvent, todoId: string) => {
        e.dataTransfer.setData('todo-id', todoId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleTodoDrop = (todoId: string, date: Date) => {
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            // Create new event
            const newEvent: CalendarEvent = {
                id: crypto.randomUUID(),
                title: todo.content,
                description: '',
                start: date,
                end: new Date(date.getTime() + 60 * 60 * 1000), // Default 1 hour
                isCompleted: todo.isCompleted,
                color: 'var(--color-blue)'
            };

            // Update events
            onEventsChange([...events, newEvent]);

            // Remove todo
            deleteTodo(todoId);
        }
    };

    const todayEvents = events.filter(event => isSameDay(new Date(event.start), new Date()));

    return (
        <div style={{ display: 'flex', gap: 'var(--spacing-xl)', height: '100%' }}>
            {/* Tasks Column */}
            <div style={{ flex: 1, maxWidth: '600px', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>Tasks</h2>

                {/* Input */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <input
                        type="text"
                        placeholder="Add a task... (Press Enter)"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleAddTodo}
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            borderBottom: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    {/* Today's Events Section */}
                    {todayEvents.length > 0 && (
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--spacing-sm)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Today's Schedule
                            </h3>
                            {todayEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="notion-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        padding: '8px 12px',
                                        border: 'none',
                                        boxShadow: 'none',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        marginBottom: '2px'
                                    }}
                                    onClick={() => toggleEvent(event.id)}
                                >
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid var(--color-blue)',
                                        borderRadius: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: event.isCompleted ? 'var(--color-blue)' : 'transparent',
                                        borderColor: 'var(--color-blue)'
                                    }}>
                                        {event.isCompleted && <span style={{ color: 'var(--text-primary)', fontSize: '12px' }}>✓</span>}
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span style={{
                                            textDecoration: event.isCompleted ? 'line-through' : 'none',
                                            color: event.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)'
                                        }}>
                                            {event.title}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                            {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: 'var(--spacing-sm) 0' }} />
                        </div>
                    )}

                    {/* Regular Todos */}
                    {todos.map(todo => (
                        <div
                            key={todo.id}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, todo.id)}
                            className="notion-card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: '8px 12px',
                                border: 'none',
                                boxShadow: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'grab'
                            }}
                            onClick={() => toggleTodo(todo.id)}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                border: '2px solid var(--text-tertiary)',
                                borderRadius: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: todo.isCompleted ? 'var(--text-primary)' : 'transparent',
                                borderColor: todo.isCompleted ? 'var(--text-primary)' : 'var(--text-tertiary)'
                            }}>
                                {todo.isCompleted && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                            </div>

                            <span style={{
                                flex: 1,
                                textDecoration: todo.isCompleted ? 'line-through' : 'none',
                                color: todo.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)'
                            }}>
                                {todo.content}
                            </span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTodo(todo.id);
                                }}
                                style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {todos.length === 0 && todayEvents.length === 0 && (
                        <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                            No tasks yet. Start typing above!
                        </div>
                    )}
                </div>
            </div>

            {/* Mini Calendar Column */}
            {showMiniCalendar && (
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Schedule</h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} style={{ padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>&lt;</button>
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{format(calendarDate, 'MMM yyyy')}</span>
                            <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} style={{ padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>&gt;</button>
                        </div>
                    </div>
                    <div style={{ flex: 1, maxHeight: '400px' }}>
                        <MonthGrid
                            currentDate={calendarDate}
                            events={events}
                            onDateClick={() => { }}
                            onEventClick={() => { }}
                            onEventMove={() => { }} // Read-only for existing events move in this view for simplicity
                            onTodoDrop={handleTodoDrop}
                        />
                    </div>
                    <div style={{ marginTop: 'var(--spacing-md)', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                        Drag tasks here to schedule them
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoList;
