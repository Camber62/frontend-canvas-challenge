type Tone = 'info' | 'error' | 'success' | 'warn';

export function StatusBanner({ tone, children }: { tone: Tone; children: string }) {
  return (
    <p className={`banner banner-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
