import { Asterisk } from "./claude/Asterisk";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";

export function Footer() {
  return (
    <footer className="mt-20 bg-[#2a2420] text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange text-white">
                <Asterisk size={20} weight={0.2} />
              </span>
              <span className="leading-tight">
                <span className="block text-[15px] font-black text-white">Claudecodeの使い手</span>
                <span className="display block text-[10px] font-bold uppercase tracking-[0.18em] text-orange-bright">
                  Master of Claude Code
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/60">
              Claude Codeの日次消費量・稼働時間・推定トークンを可視化する、ヘビーユーザー向けダッシュボード。
              記録はこのブラウザのLocalStorageにのみ保存され、サーバーには送信されません。
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/50">Menu</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#today" className="hover:text-orange-bright">今日の記録</a></li>
              <li><a href="#dashboard" className="hover:text-orange-bright">消費推移ダッシュボード</a></li>
              <li><a href="#rank" className="hover:text-orange-bright">使い手ランク・実績</a></li>
              <li><a href="#share" className="hover:text-orange-bright">Xでシェア</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/50">Links</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="https://y-studios.github.io/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-bright">
                  Y STUDIO（プロダクト一覧）
                </a>
              </li>
              <li>
                <a href="https://github.com/y-studios/claudecode-tracker" target="_blank" rel="noopener noreferrer" className="hover:text-orange-bright">
                  GitHub
                </a>
              </li>
            </ul>
            <div className="mt-6 hidden md:block">
              <ClaudeBuddy size={64} mood="sleepy" prop="coffee" tone="clay" />
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-5 text-[11px] leading-relaxed text-white/45">
          <p>
            本サイトは個人が制作した非公式のファンメイドツールであり、Anthropic社およびClaude / Claude Codeとは一切関係ありません。
            「5時間枠」「トークン上限」などの数値は利用者が手入力した自己申告値であり、実際の利用量・レートリミットとは連動していません。
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Claudecodeの使い手 / Y STUDIO</p>
        </div>
      </div>
    </footer>
  );
}
