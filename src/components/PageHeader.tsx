import CurrencyBar from './CurrencyBar';

interface Props {
  title: string;
  onBack: () => void;
}

export default function PageHeader({ title, onBack }: Props) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-5 py-3">
      <button
        onClick={onBack}
        className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-1.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-700/60 hover:text-white"
      >
        ← Back
      </button>
      <span
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500"
      >
        {title}
      </span>
      <CurrencyBar />
    </div>
  );
}
