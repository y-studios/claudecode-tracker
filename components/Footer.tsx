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
              Claude Codeの日次消費量・稼働時間・推定トークンを可視化する、個人用の実績ダッシュボード。
              ローカルのClaude Codeログから1時間ごとに自動集計・自動更新される、読み取り専用のツールです。
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/50">Menu</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#today" className="hover:text-orange-bright">今日の実績</a></li>
              <li><a href="#dashboard" className="hover:text-orange-bright">消費推移ダッシュボード</a></li>
              <li><a href="#rank" className="hover:text-orange-bright">使い手ランク・実績</a></li>
              <li><a href="#share" className="hover:text-orange-bright">Xでシェア</a></li>
            </ul>
          </div>
          <div>
            <div className="mt-6 hidden md:block">
              <ClaudeBuddy size={64} mood="sleepy" prop="coffee" tone="clay" />
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-5 text-[11px] leading-relaxed text-white/45">
          <p>
            本サイトは個人が制作した非公式のファンメイドツールであり、Anthropic社およびClaude / Claude Codeとは一切関係ありません。
            稼働時間・トークン数はローカルログからの独自の推定ロジックによる集計値であり、Anthropicが公式に提示するレートリミット表示ではありません。
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Claudecodeの使い手 / Y STUDIO</p>
        </div>
      </div>
    </footer>
  );
}
