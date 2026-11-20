import type { SeriesState, Side } from "../../contracts";
import { nameOf } from "../data/champions";

interface Props {
  side: Side;
  series: SeriesState;
}

export function SideRail({ side, series }: Props) {
  const slots = series.current.slots;
  const active = slots[series.current.cursor] ?? null;
  const bans = slots.filter((s) => s.kind === "ban" && s.side === side);
  const picks = slots.filter((s) => s.kind === "pick" && s.side === side);
  const activeIndex = active && active.side === side ? slots.indexOf(active) : -1;

  return (
    <section className="rail" data-side={side} aria-label={`${side} side`}>
      <h2 className="rail-name">{side === "blue" ? "Blue side" : "Red side"}</h2>

      <h3 className="rail-heading">Bans</h3>
      <div className="bans">
        {bans.map((s, i) => (
          <span className="ban" data-empty={s.championId === null} key={i}>
            {s.championId ? nameOf(s.championId) : "—"}
          </span>
        ))}
      </div>

      <div className="picks">
        <h3 className="rail-heading">Picks</h3>
        {picks.map((s, i) => (
          <div
            className="pick"
            data-empty={s.championId === null}
            data-active={slots.indexOf(s) === activeIndex}
            key={i}
          >
            <span className="n">{i + 1}</span>
            <span>{s.championId ? nameOf(s.championId) : "—"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
