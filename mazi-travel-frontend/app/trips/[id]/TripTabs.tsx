"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CopyInviteLink from "./CopyInviteLink";
import TripSummary from "./TripSummary";
import FlightSummary from "./FlightSummary";
import GroupSummary from "./GroupSummary";
import TripSuggestions from "./TripSuggestions";
import CompletionProgress from "./CompletionProgress";
import UpdateGroupSize from "./UpdateGroupSize";


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

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Back nav */}
        <Link
          href="/trips"
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All trips
        </Link>

        {/* Hero header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">{trip.name}</h1>
              <div className="mt-1.5 flex items-center gap-2 text-lg text-muted-foreground">
                <span className="font-medium text-foreground">
                  {trip.origin ?? "—"}
                </span>
                <span>→</span>
                <span className="font-medium text-foreground">
                  {trip.destination ?? "—"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
              {isOwner && <Badge variant="secondary">Owner</Badge>}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="px-5 py-5">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Group</p>
              <p className="text-2xl font-bold leading-none">{groupSize || "—"}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <span>people</span>
                {isOwner && groupSize > 0 && (
                  <UpdateGroupSize tripId={id} currentSize={groupSize} />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-5 py-5">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Dates</p>
              <p className="text-sm font-semibold leading-snug">{dateValue ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-5 py-5">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-semibold leading-snug">
                {trip.trip_type ? (TRIP_TYPE_LABELS?.[trip.trip_type] ?? trip.trip_type) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Completion progress */}
        <CompletionProgress
          groupSize={groupSize}
          participantsJoined={participantsJoined}
          preferencesSubmitted={preferencesSubmitted}
        />

        {/* Submit preferences CTA */}
        {currentUserIsParticipant && !currentUserSubmitted && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Your preferences are needed</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submit your preferences so the group plan can be generated.
                </p>
              </div>
              <Link href={`/trips/${id}/preferences`}>
                <Button size="sm">Submit now</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Tabs navigation */}
        <div className="mb-8 flex gap-2 border-b border-muted-foreground/10">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${tab === "group" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("group")}
          >
            Group Summary
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${tab === "flights" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("flights")}
          >
            Flight Summary
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${tab === "suggestions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("suggestions")}
          >
            Trip Suggestions
          </button>
        </div>

        {/* Tabs content */}
        {tab === "group" && (
          <>
            {/* Group summary (non-AI) */}
            {preferencesSubmitted > 0 && (
              <GroupSummary aggregated={aggregated} totalSubmitted={preferencesSubmitted} />
            )}
            {/* AI summary */}
            {allReady ? (
              <TripSummary tripId={id} existingSummary={existingSummary} ready={true} />
            ) : (
              <Card className="mb-6">
                <CardContent className="px-5 py-4">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">
                    AI Summary
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Will generate once all {groupSize} participants submit their preferences.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {tab === "flights" && (
          <div className="mb-8">
            {allReady ? (
              <FlightSummary tripId={id} existingPlan={existingPlan} ready={true} />
            ) : (
              <Card>
                <CardContent className="px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    Will generate once all {groupSize} participants submit their preferences.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {tab === "suggestions" && (
          <div className="mb-10">
            {allReady ? (
              <TripSuggestions
                tripId={id}
                existingSuggestions={existingSuggestions}
                ready={true}
              />
            ) : (
              <Card>
                <CardContent className="px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    Will generate once all {groupSize} participants submit their preferences.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Separator className="my-10" />

        {/* Participants */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
              Participants
            </h2>
            <span className="text-xs text-muted-foreground">
              {preferencesSubmitted} of {groupSize} submitted
            </span>
          </div>
          <div className="grid gap-2">
            {participantList.map((p: any) => {
              const submitted = preferences.some((pref: any) => pref.user_id === p.user_id);
              return (
                <Card key={p.user_id}>
                  <CardContent className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm">
                      {p.email}
                      {p.user_id === (props.currentUserId ?? "") && (
                        <span className="ml-1.5 text-muted-foreground">(you)</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {submitted ? (
                        <span className="text-xs text-green-600">Submitted</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                      <Badge variant={p.role === "owner" ? "default" : "secondary"}>
                        {p.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Invite link — owners only */}
        {isOwner && (
          <div className="mb-8">
            <h2 className="mb-3 text-xs uppercase tracking-widest font-semibold text-muted-foreground">
              Invite link
            </h2>
            <CopyInviteLink code={trip.invite_code} link={inviteLink} />
          </div>
        )}

        <Separator className="my-10" />
      </div>
    </div>
  );
}
