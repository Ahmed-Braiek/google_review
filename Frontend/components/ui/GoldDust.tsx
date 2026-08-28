const dots = [
  [11, 8, 4], [24, 3, 2], [39, 12, 3], [52, 5, 2], [70, 10, 4], [86, 4, 2],
  [8, 27, 2], [19, 21, 3], [34, 31, 2], [48, 22, 4], [63, 30, 2], [78, 23, 3], [92, 30, 2],
  [13, 47, 3], [28, 42, 2], [44, 51, 3], [59, 43, 2], [74, 53, 4], [89, 45, 2],
  [5, 68, 2], [21, 61, 4], [37, 73, 2], [54, 64, 3], [68, 76, 2], [84, 66, 3], [96, 74, 2],
  [16, 89, 2], [31, 83, 3], [47, 94, 2], [62, 86, 4], [79, 93, 2], [91, 84, 3],
] as const;

export function GoldDust({ sparse = false }: { sparse?: boolean }) {
  const visible = sparse ? dots.filter((_, index) => index % 2 === 0) : dots;
  return (
    <div className="gold-dust" aria-hidden="true">
      {visible.map(([left, top, size], index) => (
        <span
          key={`${left}-${top}-${index}`}
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
        />
      ))}
    </div>
  );
}
