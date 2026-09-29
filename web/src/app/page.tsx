import { GameShell } from "@/components/GameShell";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const demoMode = params.demo === "1";
  return <GameShell demoMode={demoMode} />;
}
