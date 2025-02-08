export interface Word {
    word: string;
    translation: string;
    transcription: string;
    level: string;
}

export interface WordWithStats extends Word {
    errors: number;
    lastAttempt: number;
    nextReview: number;
}

export interface UserProgress {
    words: { [key: string]: WordWithStats };
    lastStudySession: number;
    totalErrors: number;
} 