import { Asterisk } from "./claude/Asterisk";

export function SectionHeading({
  label,
  title,
  lead,
  id,
}: {
  label: string;
  title: string;
  lead?: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="section-label">
        <Asterisk size={14} weight={0.22} />
        {label}
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 className="display text-[2.6rem] leading-none font-extrabold tracking-tight text-ink sm:text-[3.4rem]">
          {title}
        </h2>
        {lead && <p className="text-sm font-medium text-ink-2">{lead}</p>}
      </div>
    </div>
  );
}
