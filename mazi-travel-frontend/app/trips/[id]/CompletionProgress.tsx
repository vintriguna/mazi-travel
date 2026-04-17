type Props = {
  groupSize: number;
  participantsJoined: number;
  preferencesSubmitted: number;
};

export default function CompletionProgress({
  groupSize,
  participantsJoined,
  preferencesSubmitted,
}: Props) {
  const joinedPct = groupSize > 0 ? (participantsJoined / groupSize) * 100 : 0;
  const prefsPct = groupSize > 0 ? (preferencesSubmitted / groupSize) * 100 : 0;

  return (
    <div
      className="mb-6 rounded-[1.25rem] p-5 space-y-4"
      style={{ background: "#F2F4F7" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-1"
        style={{ color: "#434654" }}
      >
        Trip Readiness
      </p>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: "#434654" }}>
            Participants joined
          </span>
          <span className="text-xs font-semibold" style={{ color: "#191C1E" }}>
            {participantsJoined} / {groupSize}
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ background: "#ffffff" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${joinedPct}%`,
              background: "linear-gradient(90deg, #003D9B 0%, #0052CC 100%)",
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: "#434654" }}>
            Preferences submitted
          </span>
          <span className="text-xs font-semibold" style={{ color: "#191C1E" }}>
            {preferencesSubmitted} / {groupSize}
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ background: "#ffffff" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${prefsPct}%`,
              background: "linear-gradient(90deg, #004C48 0%, #006661 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
