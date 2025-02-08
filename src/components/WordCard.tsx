import { useState, useEffect } from 'react';
import { WordWithStats } from '../types';

interface WordCardProps {
    word: WordWithStats;
    onResult: (isCorrect: boolean) => void;
    onNext: () => void;
    totalErrors: number;
}

export const WordCard: React.FC<WordCardProps> = ({ word, onResult, onNext, totalErrors }) => {
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        setShowAnswer(false);
    }, [word]);

    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    const handleResult = (remembered: boolean) => {
        onResult(remembered);
        setShowAnswer(false);
        onNext();
    };

    const formatNextReview = (timestamp: number) => {
        const now = Date.now();
        const diff = timestamp - now;
        const hours = Math.round(diff / (1000 * 60 * 60));
        
        if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        const days = Math.round(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''}`;
    };

    return (
        <div className="word-card">
            <div className="word-header">
                <h2>{word.word}</h2>
                <p className="transcription">{word.transcription}</p>
                <p className="level">Level: {word.level}</p>
            </div>

            {!showAnswer ? (
                <div className="word-actions">
                    <button 
                        onClick={handleShowAnswer}
                        className="show-button"
                    >
                        Show Translation
                    </button>
                </div>
            ) : (
                <div className="word-result">
                    <div className="translation-box">
                        <h3>Translation:</h3>
                        <p className="translation">{word.translation}</p>
                    </div>
                    <div className="word-actions">
                        <button 
                            onClick={() => handleResult(false)}
                            className="dont-remember-button"
                        >
                            Don't Remember
                        </button>
                        <button 
                            onClick={() => handleResult(true)}
                            className="remember-button"
                        >
                            Remember
                        </button>
                    </div>
                </div>
            )}

            <div className="word-stats">
                <p>Word errors: {word.errors}</p>
                <p>Total errors: {totalErrors}</p>
                <p>Next review in: {formatNextReview(word.nextReview)}</p>
            </div>
        </div>
    );
}; 