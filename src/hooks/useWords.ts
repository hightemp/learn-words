import { useState, useEffect } from 'react';
import { Word, WordWithStats, UserProgress } from '../types';
import oxford3000 from '../words/oxford_3000.json';
import oxford5000 from '../words/oxford_5000.json';

const wordsList = [...oxford3000, ...oxford5000];

const STORAGE_KEY = 'learn-words-progress';
const REVIEW_INTERVAL = 24 * 60 * 60 * 1000;

export const useWords = (selectedLevel?: string) => {
    const [progress, setProgress] = useState<UserProgress>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : { words: {}, lastStudySession: 0, totalErrors: 0 };
    });

    const [currentWord, setCurrentWord] = useState<WordWithStats | null>(null);
    const [lastWordId, setLastWordId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }, [progress]);

    const initializeWords = () => {
        const initialWords = wordsList.reduce((acc: { [key: string]: WordWithStats }, word: Word) => {
            if (!progress.words[word.word] && (!selectedLevel || word.level === selectedLevel)) {
                acc[word.word] = {
                    ...word,
                    errors: 0,
                    lastAttempt: 0,
                    nextReview: Date.now()
                };
            }
            return acc;
        }, {});

        setProgress(prev => ({
            ...prev,
            words: { ...prev.words, ...initialWords },
            totalErrors: 0
        }));
        setLastWordId(null);
    };

    const shuffle = <T>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const MAX_PROBLEM_WORDS_PER_SESSION = 3;

    const getNextWord = () => {
        const now = Date.now();
        const availableWords = Object.values(progress.words)
            .filter(word =>
                word.nextReview <= now &&
                word.word !== lastWordId &&
                (!selectedLevel || word.level === selectedLevel)
            );

        if (availableWords.length === 0) {
            setCurrentWord(null);
            setLastWordId(null);
            return null;
        }

        const wordsByErrors = availableWords.reduce((acc, word) => {
            const errorCount = word.errors;
            if (!acc[errorCount]) {
                acc[errorCount] = [];
            }
            acc[errorCount].push(word);
            return acc;
        }, {} as { [key: number]: WordWithStats[] });

        const errorGroups = Object.keys(wordsByErrors)
            .map(Number)
            .sort((a, b) => b - a);

        // Выбираем группу слов для изучения
        let selectedGroup: WordWithStats[] = [];
        
        if (errorGroups[0] > 0) {
            const problemWordsCount = wordsByErrors[errorGroups[0]]
                .filter(w => w.lastAttempt > Date.now() - REVIEW_INTERVAL)
                .length;

            if (problemWordsCount < MAX_PROBLEM_WORDS_PER_SESSION) {
                selectedGroup = wordsByErrors[errorGroups[0]];
            } else {
                const randomGroupIndex = Math.floor(Math.random() * errorGroups.length);
                selectedGroup = wordsByErrors[errorGroups[randomGroupIndex]];
            }
        } else {
            selectedGroup = wordsByErrors[errorGroups[0]];
        }

        const shuffledGroup = shuffle(selectedGroup);
        const nextWord = shuffledGroup[0];

        setCurrentWord(nextWord);
        setLastWordId(nextWord.word);
        return nextWord;
    };

    const recordAttempt = (word: string, isCorrect: boolean) => {
        setProgress(prev => {
            const wordStats = prev.words[word];
            if (!wordStats) return prev;

            const now = Date.now();
            const newErrors = wordStats.errors + (isCorrect ? 0 : 1);
            const interval = isCorrect
                ? REVIEW_INTERVAL * Math.pow(2, Math.min(wordStats.errors, 5))
                : REVIEW_INTERVAL;

            return {
                ...prev,
                words: {
                    ...prev.words,
                    [word]: {
                        ...wordStats,
                        errors: newErrors,
                        lastAttempt: now,
                        nextReview: now + interval
                    }
                },
                lastStudySession: now,
                totalErrors: prev.totalErrors + (isCorrect ? 0 : 1)
            };
        });
    };

    const resetProgress = () => {
        localStorage.removeItem(STORAGE_KEY);
        setProgress({ words: {}, lastStudySession: 0, totalErrors: 0 });
        setLastWordId(null);
        initializeWords();
    };

    return {
        progress,
        currentWord,
        initializeWords,
        getNextWord,
        recordAttempt,
        resetProgress
    };
}; 