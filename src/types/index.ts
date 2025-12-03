export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
    color?: string;
    isCompleted?: boolean;
    isAllDay?: boolean;
    tagIds?: string[];
    // Deprecated: tags (string[]) - kept for migration if needed, but we'll try to migrate immediately
    tags?: string[];
}

export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface Todo {
    id: string;
    content: string;
    isCompleted: boolean;
    createdAt: Date;
}
