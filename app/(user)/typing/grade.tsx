"use client";

type Props = {
  wpm: string;
  accuracy: number;
  time: string;
};

export default function Grade({ wpm, accuracy, time }: Props) {
  return (
    <div className="mt-10 grid w-full grid-cols-3 items-center border-t border-border bg-muted/40 px-6 py-5 text-center">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
          WPM
        </p>
        <p className="mt-1 text-2xl font-semibold">{wpm}</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
          Time
        </p>
        <p className="mt-1 text-4xl font-semibold">{time}s</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
          Accuracy
        </p>
        <p className="mt-1 text-2xl font-semibold">{accuracy}%</p>
      </div>
      <div></div>
      <div className="mt-10 text-center text-muted-foreground/50">
        <kbd className="bg-gray-100 rounded border px-2 py-1 text-[17px]">&gt; ENTER</kbd>
        <span className="ml-2">to continue</span>
      </div>
    </div>
  );
}
