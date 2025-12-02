import { useState, useEffect } from 'react';
import CalendarView from './components/Calendar/CalendarView';
import TodoList from './components/Todo/TodoList';
import PomodoroTimer from './components/Timer/PomodoroTimer';
import type { CalendarEvent, Todo } from './types';

type View = 'calendar' | 'tasks' | 'focus';

function App() {
  const [activeView, setActiveView] = useState<View>('calendar');

  // Lifted State
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : [];
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleTodoDrop = (todoId: string, date: Date) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: todo.content,
        description: '',
        start: date,
        end: new Date(date.getTime() + 60 * 60 * 1000),
        isCompleted: todo.isCompleted,
        color: 'var(--color-blue)'
      };
      setEvents([...events, newEvent]);
      setTodos(todos.filter(t => t.id !== todoId));
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--spacing-md)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: 'var(--spacing-xl)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Workspace
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <div
            onClick={() => setActiveView('calendar')}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: activeView === 'calendar' ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: activeView === 'calendar' ? 'rgba(0,0,0,0.05)' : 'transparent',
              fontWeight: activeView === 'calendar' ? 500 : 400
            }}
          >
            🏠 Dashboard
          </div>
          <div
            onClick={() => setActiveView('focus')}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: activeView === 'focus' ? 'var(--text-primary)' : 'var(--text-secondary)',
              backgroundColor: activeView === 'focus' ? 'rgba(0,0,0,0.05)' : 'transparent',
              fontWeight: activeView === 'focus' ? 500 : 400
            }}
          >
            ⏱️ Focus
          </div>
        </nav>

        <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-tertiary)', padding: '0 8px' }}>
          v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'var(--spacing-xl)', overflowY: 'auto' }}>
        {activeView === 'calendar' && (
          <div style={{ display: 'flex', height: '100%', gap: 'var(--spacing-xl)' }}>
            <div style={{ width: '350px', borderRight: '1px solid var(--border-subtle)', paddingRight: 'var(--spacing-lg)' }}>
              <TodoList
                todos={todos}
                onTodosChange={setTodos}
                events={events}
                onEventsChange={setEvents}
                showMiniCalendar={false}
              />
            </div>
            <div style={{ flex: 1 }}>
              <CalendarView
                events={events}
                onEventsChange={setEvents}
                onTodoDrop={handleTodoDrop}
                onDeleteEvent={handleDeleteEvent}
              />
            </div>
          </div>
        )}
        {activeView === 'tasks' && (
          <TodoList
            todos={todos}
            onTodosChange={setTodos}
            events={events}
            onEventsChange={setEvents}
          />
        )}
        {activeView === 'focus' && <PomodoroTimer />}
      </main>
    </div>
  );
}

export default App;
