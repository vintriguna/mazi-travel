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
    <div className="mb-6 space-y-3">
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Participants joined</span>
          <span>
            {participantsJoined} / {groupSize}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${joinedPct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Preferences submitted</span>
          <span>
            {preferencesSubmitted} / {groupSize}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${prefsPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
