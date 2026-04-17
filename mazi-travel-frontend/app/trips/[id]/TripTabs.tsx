"use client";
import { useState } from "react";
import Link from "next/link";
import CopyInviteLink from "./CopyInviteLink";
import TripSummary from "./TripSummary";
import FlightSummary from "./FlightSummary";
import GroupSummary from "./GroupSummary";
import TripSuggestions from "./TripSuggestions";
import CompletionProgress from "./CompletionProgress";
import UpdateGroupSize from "./UpdateGroupSize";
import { ArrowLeft, Calendar, Users, Briefcase, PlaneTakeoff, ArrowRight } from "lucide-react";

export default function TripTabs(props: any) {
  const [tab, setTab] = useState("group");
  const {
    trip, isOwner, id, groupSize, participantsJoined, preferencesSubmitted,
    currentUserIsParticipant, currentUserSubmitted, aggregated, preferences, participantList,
    inviteLink, allReady, existingSuggestions, existingSummary, existingPlan, TRIP_TYPE_LABELS
  } = props;

  const dateValue =
    trip.start_date && trip.end_date
      ? `${trip.start_date} → ${trip.end_date}`
      : trip.start_date || trip.end_date || null;

  const tabs = [
    { id: "group", label: "Group Summary" },
    { id: "flights", label: "Flights" },
    { id: "suggestions", label: "Suggestions" },
  ];

  const statCard = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div
      className="rounded-[1.25rem] p-4"
      style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#434654" }}>
          {label}
        </span>
      </div>
      <div className="text-sm font-semibold leading-snug" style={{ color: "#191C1E" }}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Back nav */}
        <Link
          href="/trips"
          className="mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#434654" }}
        >
          <ArrowLeft className="h-4 w-4" />
          All trips
        </Link>

        {/* Hero header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Route chip */}
              <div className="flex items-center gap-1.5 mb-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "#006661", color: "#5DE7DE" }}
                >
                  {trip.origin ?? "—"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" style={{ color: "#C3C6D6" }} />
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "#006661", color: "#5DE7DE" }}
                >
                  {trip.destination ?? "—"}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-jakarta, system-ui)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#191C1E",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {trip.name}
              </h1>
            </div>
            {isOwner && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold mt-1 shrink-0"
                style={{ background: "#003D9B", color: "#ffffff" }}
              >
                Owner
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {statCard(
            <Users className="h-4 w-4 text-[#003D9B]" />,
            "Group",
            <span>
              {groupSize || "—"}
              {isOwner && groupSize > 0 && (
                <UpdateGroupSize tripId={id} currentSize={groupSize} />
              )}
            </span>
          )}
          {statCard(
            <Calendar className="h-4 w-4 text-[#003D9B]" />,
            "Dates",
            dateValue ?? "—"
          )}
          {statCard(
            <Briefcase className="h-4 w-4 text-[#003D9B]" />,
            "Type",
            trip.trip_type ? (TRIP_TYPE_LABELS?.[trip.trip_type] ?? trip.trip_type) : "—"
          )}
        </div>

        {/* Completion progress */}
        <CompletionProgress
          groupSize={groupSize}
          participantsJoined={participantsJoined}
          preferencesSubmitted={preferencesSubmitted}
        />

        {/* Submit preferences CTA */}
        {currentUserIsParticipant && !currentUserSubmitted && (
          <div
            className="mb-6 rounded-[1.25rem] p-5 flex items-center justify-between gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(0,61,155,0.06) 0%, rgba(0,82,204,0.06) 100%)",
              outline: "1.5px solid rgba(0,61,155,0.15)",
            }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "#003D9B" }}>
                Your preferences are needed
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#434654" }}>
                Submit your preferences so the group plan can be generated.
              </p>
            </div>
            <Link href={`/trips/${id}/preferences`}>
              <button className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap">
                Submit now
              </button>
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div
          className="mb-6 flex gap-1 rounded-xl p-1"
          style={{ background: "#F2F4F7" }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
              style={
                tab === t.id
                  ? {
                      background: "#ffffff",
                      color: "#003D9B",
                      boxShadow: "0px 2px 8px rgba(25,28,30,0.08)",
                    }
                  : { color: "#434654" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "group" && (
          <>
            {preferencesSubmitted > 0 && (
              <GroupSummary aggregated={aggregated} totalSubmitted={preferencesSubmitted} />
            )}
            {allReady ? (
              <TripSummary tripId={id} existingSummary={existingSummary} ready={true} />
            ) : (
              <div
                className="mb-6 rounded-[1.25rem] p-5"
                style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#434654" }}>
                  AI Summary
                </p>
                <p className="text-sm" style={{ color: "#434654" }}>
                  Will generate once all {groupSize} participants submit their preferences.
                </p>
              </div>
            )}
          </>
        )}

        {tab === "flights" && (
          <div className="mb-8">
            {allReady ? (
              <FlightSummary tripId={id} existingPlan={existingPlan} ready={true} />
            ) : (
              <div
                className="rounded-[1.25rem] p-5"
                style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
              >
                <p className="text-sm" style={{ color: "#434654" }}>
                  Will generate once all {groupSize} participants submit their preferences.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "suggestions" && (
          <div className="mb-10">
            {allReady ? (
              <TripSuggestions tripId={id} existingSuggestions={existingSuggestions} ready={true} />
            ) : (
              <div
                className="rounded-[1.25rem] p-5"
                style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
              >
                <p className="text-sm" style={{ color: "#434654" }}>
                  Will generate once all {groupSize} participants submit their preferences.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Participants */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#434654" }}>
              Participants
            </h2>
            <span className="text-xs" style={{ color: "#434654" }}>
              {preferencesSubmitted} of {groupSize} submitted
            </span>
          </div>
          <div className="grid gap-2">
            {participantList.map((p: any) => {
              const submitted = preferences.some((pref: any) => pref.user_id === p.user_id);
              return (
                <div
                  key={p.user_id}
                  className="flex items-center justify-between rounded-[1rem] px-5 py-3.5"
                  style={{ background: "#ffffff", boxShadow: "0px 4px 12px rgba(25,28,30,0.05)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #003D9B 0%, #0052CC 100%)" }}
                    >
                      {p.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm" style={{ color: "#191C1E" }}>
                      {p.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {submitted ? (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: "#004C48", color: "#5DE7DE" }}
                      >
                        Submitted
                      </span>
                    ) : (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ background: "#F2F4F7", color: "#434654" }}
                      >
                        Pending
                      </span>
                    )}
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        p.role === "owner"
                          ? { background: "#003D9B", color: "#ffffff" }
                          : { background: "#F2F4F7", color: "#434654" }
                      }
                    >
                      {p.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invite link */}
        {isOwner && (
          <div className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#434654" }}>
              Invite link
            </h2>
            <CopyInviteLink code={trip.invite_code} link={inviteLink} />
          </div>
        )}
      </div>
    </div>
  );
}
