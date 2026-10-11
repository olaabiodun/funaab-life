import FunaabLifeGame from './FunaabLifeGame';

export const metadata = {
  title: 'FUNAAB Life - Campus Survival Simulator',
  description: 'A viral, responsive campus life simulation browser game set in the Federal University of Agriculture, Abeokuta (FUNAAB).',
};

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-slate-950">
      <FunaabLifeGame />
    </main>
  );
}
