/**
 * /tarot/oracle — Pick-a-Card Oracle reading page
 *
 * Hosted within the tarot shop but accessible directly.
 * Three weekly themes, 4 piles per session, streaming Oracle reading.
 */

import Link from "next/link";
import PickACardView from "@/components/ui/PickACardView";

export const metadata = {
  title: "週神諭 · Oracle | 月之塔羅店鋪",
  description: "選擇一疊牌，讓愛神、黎明之神、或永夜女神給你這週的神諭指引。",
};

export default function OraclePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Back nav */}
      <Link
        href="/tarot"
        className="fixed top-4 left-4 z-20 px-3.5 py-1.5 rounded-full border border-morandi-lavender/25 bg-black/35 backdrop-blur-sm text-cream-200/75 hover:text-cream-100 hover:border-morandi-lavender/50 text-xs tracking-widest transition-colors duration-300"
      >
        {"← 回到塔羅店"}
      </Link>

      <PickACardView />
    </main>
  );
}
