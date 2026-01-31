"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    StickyNote,
    Type,
    Trash2,
    Send,
    Move,
    Users,
    MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Note {
    id: string;
    type: "sticky" | "text" | "image";
    content: string;
    x: number;
    y: number;
    color: string;
}

const colorOptions = [
    "bg-yellow-200 dark:bg-yellow-900",
    "bg-pink-200 dark:bg-pink-900",
    "bg-blue-200 dark:bg-blue-900",
    "bg-green-200 dark:bg-green-900",
    "bg-purple-200 dark:bg-purple-900",
];

const initialNotes: Note[] = [
    {
        id: "1",
        type: "sticky",
        content: "Launch campaign idea: Behind the scenes content",
        x: 100,
        y: 100,
        color: colorOptions[0],
    },
    {
        id: "2",
        type: "sticky",
        content: "User testimonial video series",
        x: 350,
        y: 150,
        color: colorOptions[1],
    },
    {
        id: "3",
        type: "sticky",
        content: "Weekly tips thread on Twitter",
        x: 600,
        y: 100,
        color: colorOptions[2],
    },
    {
        id: "4",
        type: "text",
        content: "Q1 2026 Content Strategy",
        x: 250,
        y: 350,
        color: "bg-transparent",
    },
    {
        id: "5",
        type: "sticky",
        content: "Partner with micro-influencers",
        x: 500,
        y: 300,
        color: colorOptions[3],
    },
];

export default function WhiteboardPage() {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [draggedNote, setDraggedNote] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const addNote = (type: "sticky" | "text") => {
        const newNote: Note = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === "sticky" ? "New idea..." : "Add text",
            x: Math.random() * 400 + 100,
            y: Math.random() * 200 + 100,
            color:
                type === "sticky"
                    ? colorOptions[
                          Math.floor(Math.random() * colorOptions.length)
                      ]
                    : "bg-transparent",
        };
        setNotes([...notes, newNote]);
    };

    const updateNote = (id: string, content: string) => {
        setNotes(notes.map((n) => (n.id === id ? { ...n, content } : n)));
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter((n) => n.id !== id));
        setSelectedNote(null);
    };

    const handleMouseDown = (
        e: React.MouseEvent,
        noteId: string,
        noteX: number,
        noteY: number,
    ) => {
        setDraggedNote(noteId);
        setDragOffset({
            x: e.clientX - noteX,
            y: e.clientY - noteY,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggedNote) {
            const boardRect = e.currentTarget as HTMLDivElement;
            const newX = e.clientX - boardRect.offsetLeft - dragOffset.x;
            const newY = e.clientY - boardRect.offsetTop - 19;
            setNotes(
                notes.map((n) =>
                    n.id === draggedNote
                        ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
                        : n,
                ),
            );
        }
    };

    const handleMouseUp = () => {
        setDraggedNote(null);
    };

    return (
        <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Whiteboard</h1>
                    <p className="text-muted-foreground">
                        Brainstorm and collaborate on content ideas
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />1 online
                    </Badge>
                    <Button variant="outline" onClick={() => addNote("sticky")}>
                        <StickyNote className="h-4 w-4 mr-2" />
                        Add Note
                    </Button>
                    <Button variant="outline" onClick={() => addNote("text")}>
                        <Type className="h-4 w-4 mr-2" />
                        Add Text
                    </Button>
                </div>
            </div>

            <Card className="flex-1 bg-card border-border overflow-hidden">
                <CardContent className="p-0 h-full">
                    <div
                        className="relative w-full h-full bg-[radial-gradient(circle,_oklch(0.25_0.01_285)_1px,_transparent_1px)] bg-[length:20px_20px]"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className={cn(
                                    "absolute cursor-move select-none",
                                    selectedNote === note.id &&
                                        "ring-2 ring-primary",
                                )}
                                style={{ left: note.x, top: note.y }}
                                onMouseDown={(e) =>
                                    handleMouseDown(e, note.id, note.x, note.y)
                                }
                                onClick={() => setSelectedNote(note.id)}
                            >
                                {note.type === "sticky" ? (
                                    <div
                                        className={cn(
                                            "w-48 p-3 rounded-lg shadow-lg transition-shadow hover:shadow-xl",
                                            note.color,
                                            "text-foreground",
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <Move className="h-4 w-4 text-foreground/30" />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 -mr-2 -mt-1"
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send to Create
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            deleteNote(note.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <Input
                                            value={note.content}
                                            onChange={(e) =>
                                                updateNote(
                                                    note.id,
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-transparent border-none p-0 h-auto text-sm focus-visible:ring-0 resize-none"
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="group">
                                        <Input
                                            value={note.content}
                                            onChange={(e) =>
                                                updateNote(
                                                    note.id,
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-transparent border-none p-2 text-lg font-semibold focus-visible:ring-1 focus-visible:ring-primary"
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -right-8 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100"
                                            onClick={() => deleteNote(note.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
