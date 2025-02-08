import { useEffect, useState } from 'react';
import { WordCard } from './components/WordCard';
import { useWords } from './hooks/useWords';
import './App.css';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function App() {
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const {
        progress,
        currentWord,
        initializeWords,
        getNextWord,
        recordAttempt,
        resetProgress
    } = useWords(selectedLevel || undefined);

    useEffect(() => {
        if (selectedLevel) {
            initializeWords();
            getNextWord();
        }
    }, [selectedLevel]);

    const handleResult = (isCorrect: boolean) => {
        if (currentWord) {
            recordAttempt(currentWord.word, isCorrect);
        }
    };

    const handleNext = () => {
        getNextWord();
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>
                    Изучение слов
                    {selectedLevel && <span className="current-level"> Уровень {selectedLevel}</span>}
                </h1>
                <button
                    onClick={() => {
                        resetProgress();
                        setSelectedLevel(null);
                    }}
                    className="reset-button"
                >
                    Сбросить прогресс
                </button>
            </header>

            <main className="app-main">
                {!selectedLevel ? (
                    <div className="level-select">
                        <h2>Выберите уровень сложности</h2>
                        <div className="level-buttons">
                            {LEVELS.map(level => (
                                <button
                                    key={level}
                                    className="level-button"
                                    onClick={() => {
                                        resetProgress();
                                        setSelectedLevel(level);
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : currentWord ? (
                    <WordCard
                        word={currentWord}
                        onResult={handleResult}
                        onNext={handleNext}
                        totalErrors={progress.totalErrors}
                    />
                ) : (
                    <div className="no-words">
                        <p>Нет доступных слов для повторения.</p>
                        <p>Возвращайтесь позже!</p>
                        <button
                            className="reset-button"
                            onClick={() => setSelectedLevel(null)}
                        >
                            Выбрать другой уровень
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
