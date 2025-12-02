export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
    color?: string;
    isCompleted?: boolean;
    isAllDay?: boolean;
}

export interface Todo {
    id: string;
    content: string;
    isCompleted: boolean;
    createdAt: Date;
}
