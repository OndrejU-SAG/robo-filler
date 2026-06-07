import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, AlertTriangle, RotateCcw, ChevronRight, Loader2, FlaskConical, Search } from 'lucide-react';
import type { Article, SearchResult } from '../types';
import { search } from '../utils/searchEngine';
import { ResultCard } from './ResultCard';
import {
  COMPONENT_GUIDES, findComponentGuide, findNextActiveIndex,
  type ComponentGuide,
} from '../data/guideConfig';

interface ConversationEntry {
  question: string;
  answer: string;
}

type Phase = 'beta-warning' | 'initial' | 'questioning' | 'searching' | 'results';

interface Props {
  articles: Article[];
}

export function GuidedSearch({ articles }: Props) {
  const [phase, setPhase] = useState<Phase>('beta-warning');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [input, setInput] = useState('');
  const [guide, setGuide] = useState<ComponentGuide | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);
  const [notFoundHint, setNotFoundHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const INITIAL_Q = 'Jakou komponentu hledáš?';
  const INITIAL_PH = 'např. Jistič, Stykač, Relé, Napájecí zdroj, DIN lišta...';

  // Aktivní (podmínkám vyhovující) počet otázek pro aktuální stav odpovědí
  const activeQuestionCount = useMemo(() => {
    if (!guide) return 0;
    return guide.questions.filter(q => !q.condition || q.condition(answers)).length;
  }, [guide, answers]);

  // Pořadí aktuální otázky mezi aktivními (1-based)
  const activeQuestionPos = useMemo(() => {
    if (!guide) return 0;
    let pos = 0;
    for (let i = 0; i <= questionIndex && i < guide.questions.length; i++) {
      const q = guide.questions[i];
      if (!q.condition || q.condition(answers)) pos++;
    }
    return pos;
  }, [guide, questionIndex, answers]);

  useEffect(() => {
    if (phase !== 'beta-warning') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [phase, questionIndex]);

  const currentQ = guide?.questions[questionIndex];

  const currentOpts = currentQ?.options;
  const isCurrentOptional = !!currentQ?.optional;

  const runSearches = useCallback((queries: string[]) => {
    setPhase('searching');
    setTimeout(() => {
      const seen = new Set<string>();
      const all: SearchResult[] = [];

      for (const q of queries) {
        const res = search(articles, { mode: 'combined', field: 'all', query: q, maxResults: 30 });
        for (const r of res) {
          if (!seen.has(r.artikl)) {
            seen.add(r.artikl);
            all.push(r);
          }
        }
      }

      all.sort((a, b) => b.score - a.score);
      setSearchResults(all.slice(0, 60));
      setPhase('results');
    }, 600);
  }, [articles]);

  const advanceAfterAnswer = useCallback(
    (newAnswers: Record<string, string>, newConv: ConversationEntry[]) => {
      if (!guide) return;
      // Najít další aktivní otázku (s ohledem na nové odpovědi)
      const nextIdx = findNextActiveIndex(guide.questions, newAnswers, questionIndex + 1);

      if (nextIdx === null) {
        const queries = guide.generateQueries(newAnswers);
        setGeneratedQueries(queries);
        setConversation(newConv);
        runSearches(queries);
      } else {
        setAnswers(newAnswers);
        setConversation(newConv);
        setQuestionIndex(nextIdx);
        setInput('');
      }
    },
    [guide, questionIndex, runSearches]
  );

  const submitAnswer = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed && !isCurrentOptional) return;

      if (phase === 'initial') {
        const found = findComponentGuide(trimmed);
        if (found) {
          setNotFoundHint(false);
          setGuide(found);
          setConversation([{ question: INITIAL_Q, answer: trimmed }]);
          setQuestionIndex(0);
          setAnswers({});
          setInput('');
          setPhase('questioning');
        } else {
          setNotFoundHint(true);
          setInput('');
        }
        return;
      }

      if (phase === 'questioning' && guide && currentQ) {
        const newAnswers = { ...answers, [currentQ.id]: trimmed || '(přeskočeno)' };
        const displayAnswer = trimmed || '(přeskočeno)';
        const newConv = [...conversation, { question: currentQ.question, answer: displayAnswer }];
        advanceAfterAnswer(newAnswers, newConv);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, guide, currentQ, answers, conversation, isCurrentOptional, advanceAfterAnswer]
  );

  const handleOptionClick = (opt: string) => submitAnswer(opt);

  const handleReset = () => {
    setPhase('initial');
    setConversation([]);
    setInput('');
    setGuide(null);
    setQuestionIndex(0);
    setAnswers({});
    setSearchResults([]);
    setGeneratedQueries([]);
    setNotFoundHint(false);
  };

  // ── Beta warning ─────────────────────────────────────────────────────────
  if (phase === 'beta-warning') {
    return (
      <div className="fixed inset-0 bg-base/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-mantle rounded-2xl p-8 max-w-md w-full shadow-xl border border-surface1 animate-fade-in">
          <div className="flex items-start gap-3 mb-5">
            <AlertTriangle size={22} className="text-yellow mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-text">Řízený režim</h2>
                <span className="px-2 py-0.5 bg-yellow/20 text-yellow text-xs font-bold rounded-md uppercase tracking-widest">
                  BETA
                </span>
              </div>
              <p className="text-subtext0 text-sm">Průvodce vyhledáváním komponent</p>
            </div>
          </div>

          <p className="text-subtext1 mb-4 leading-relaxed text-sm">
            Průvodce vás provede strukturovaným vyhledáváním pomocí série otázek a na základě
            vašich odpovědí automaticky vygeneruje optimalizované vyhledávací výrazy.
          </p>

          <div className="bg-surface0 rounded-xl p-4 mb-6 space-y-1.5">
            <p className="text-xs text-overlay1 uppercase tracking-wide font-medium mb-2">Upozornění</p>
            <p className="text-sm text-subtext0">• Průvodce podporuje omezenou sadu komponent (15 typů)</p>
            <p className="text-sm text-subtext0">• Výsledky závisí na obsahu vybrané databáze</p>
            <p className="text-sm text-subtext0">• Funkce je aktivně vyvíjena a může se měnit</p>
          </div>

          <button
            onClick={() => setPhase('initial')}
            className="w-full py-3 bg-mauve text-crust rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Rozumím, spustit průvodce
          </button>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex gap-4" style={{ minHeight: '540px' }}>

      {/* Left: history */}
      <div className="w-52 flex-shrink-0 bg-mantle rounded-2xl p-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-subtext0 text-xs uppercase tracking-wide font-medium">Průběh</span>
          {(conversation.length > 0 || phase === 'results') && (
            <button onClick={handleReset} title="Začít znovu" className="text-overlay1 hover:text-red transition-colors">
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {conversation.length === 0 && phase === 'initial' ? (
            <p className="text-overlay0 text-xs leading-relaxed">
              Odpovědi na otázky se zobrazí zde.
            </p>
          ) : (
            conversation.map((entry, i) => (
              <div key={i}>
                <p className="text-xs text-subtext0 leading-tight mb-0.5">{entry.question}</p>
                <div className="flex items-start gap-1">
                  <ChevronRight size={11} className="text-mauve flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text font-medium leading-tight">{entry.answer}</p>
                </div>
              </div>
            ))
          )}

          {guide && phase === 'questioning' && (
            <div className="pt-2 border-t border-surface1 mt-1">
              <p className="text-xs text-overlay0">
                Otázka {activeQuestionPos} / {activeQuestionCount}
              </p>
            </div>
          )}
        </div>

        {/* Component list during initial phase */}
        {phase === 'initial' && (
          <div className="mt-4 border-t border-surface1 pt-4 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '280px' }}>
            <p className="text-xs text-overlay0 uppercase tracking-wide mb-2">Podporované</p>
            <div className="space-y-1">
              {COMPONENT_GUIDES.map(g => (
                <button
                  key={g.id}
                  onClick={() => submitAnswer(g.name)}
                  className="w-full text-left text-xs text-subtext0 hover:text-mauve transition-colors py-0.5 leading-tight"
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-mantle rounded-2xl p-6 flex flex-col min-w-0">

        {/* Questioning / Initial */}
        {(phase === 'initial' || phase === 'questioning') && (
          <>
            {guide && (
              <div className="mb-5 flex items-center gap-2">
                <span className="text-sm font-semibold text-mauve">{guide.name}</span>
                <span className="text-xs text-overlay0">— {guide.description}</span>
              </div>
            )}

            <div className="flex-1 flex flex-col justify-center max-w-2xl">
              {/* Question text */}
              <p className="text-2xl md:text-3xl text-text font-medium mb-6 leading-snug">
                {phase === 'initial' ? INITIAL_Q : (currentQ?.question ?? '')}
              </p>

              {/* Option chips */}
              {currentOpts && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {currentOpts.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleOptionClick(opt)}
                      className="px-4 py-2 rounded-xl bg-surface0 hover:bg-mauve hover:text-crust text-sm text-subtext1 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Manufacturer chips for 'vyrobce' question */}
              {guide && phase === 'questioning' && currentQ?.id === 'vyrobce' && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {guide.knownManufacturers.map(m => (
                    <button
                      key={m}
                      onClick={() => handleOptionClick(m)}
                      className="px-3 py-1 rounded-lg bg-surface0 hover:bg-mauve hover:text-crust text-xs text-subtext0 transition-all"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {/* Not-found hint */}
              {notFoundHint && phase === 'initial' && (
                <div className="mb-4 flex items-start gap-2 bg-yellow/10 border border-yellow/20 rounded-xl p-3">
                  <FlaskConical size={15} className="text-yellow flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-subtext1">
                    Komponenta nebyla rozpoznána. Zkuste jiný název nebo klikněte na komponentu vlevo.
                  </p>
                </div>
              )}
            </div>

            {/* Input row */}
            <div className="flex gap-2 mt-4">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitAnswer(input); }}
                placeholder={
                  phase === 'initial'
                    ? INITIAL_PH
                    : (currentQ?.placeholder ?? 'Zadejte odpověď...')
                }
                className="flex-1 bg-surface0 rounded-xl px-4 py-3 text-text placeholder:text-overlay0 outline-none focus:ring-2 focus:ring-mauve transition-all text-sm"
              />
              {isCurrentOptional && (
                <button
                  onClick={() => submitAnswer('')}
                  className="px-4 py-3 rounded-xl bg-surface0 hover:bg-surface1 text-subtext0 text-sm transition-all whitespace-nowrap"
                >
                  Přeskočit
                </button>
              )}
              <button
                onClick={() => submitAnswer(input)}
                disabled={!input.trim() && !isCurrentOptional}
                className="px-5 py-3 bg-mauve text-crust rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Send size={15} />
                <span className="hidden sm:inline text-sm">Odeslat</span>
              </button>
            </div>
          </>
        )}

        {/* Searching */}
        {phase === 'searching' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <Loader2 className="text-mauve animate-spin" size={44} />
            <p className="text-subtext1 text-lg">Vyhledávám...</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {generatedQueries.map(q => (
                <span key={q} className="px-3 py-1 bg-surface0 rounded-lg text-sm text-mauve font-mono">{q}</span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'results' && (
          <div className="flex flex-col gap-4 overflow-hidden min-h-0 h-full">
            <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              <div className="flex flex-wrap gap-2 items-center min-w-0">
                <Search size={14} className="text-subtext0 flex-shrink-0" />
                <span className="text-sm text-subtext1 flex-shrink-0">Výrazy:</span>
                {generatedQueries.map(q => (
                  <span key={q} className="px-2 py-0.5 bg-surface0 rounded-lg text-xs text-mauve font-mono">
                    {q}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm text-subtext0">{searchResults.length} výsledků</span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface0 hover:bg-surface1 text-subtext1 text-sm transition-all"
                >
                  <RotateCcw size={13} />
                  Nové hledání
                </button>
              </div>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 min-h-0 pr-1">
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <p className="text-overlay1 text-lg">Žádné výsledky nenalezeny</p>
                  <p className="text-overlay0 text-sm max-w-sm">
                    Zkuste upravit parametry nebo spusťte nové hledání s jinými hodnotami
                  </p>
                </div>
              ) : (
                searchResults.map((result, i) => (
                  <ResultCard key={`${result.artikl}-${i}`} result={result} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
