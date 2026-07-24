"use client";

import { Gauge, Target, Timer } from "lucide-react";

import { Dialog, DialogContent, } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  wpm: string;
  accuracy: number;
  time: string;
};

export default function Grade({ wpm, accuracy, time }: Props) {
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden border-border p-0 shadow-xl"
      >
        <Separator />

        <div className="grid grid-cols-3 gap-3 p-6">
          <Card className="border-border bg-card shadow-none">
            <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
              <Gauge className="size-5 text-muted-foreground" />

              <div>
                <p className="text-2xl font-bold tabular-nums">{wpm}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  WPM
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-none">
            <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
              <Target className="size-5 text-muted-foreground" />

              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {accuracy}
                  <span className="text-base">%</span>
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Accuracy
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-none">
            <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
              <Timer className="size-5 text-muted-foreground" />

              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {time}
                  <span className="ml-0.5 text-sm">s</span>
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="border-t border-border bg-background px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Press{" "}
            <kbd className="pointer-events-none mx-1 inline-flex h-6 select-none items-center rounded-md border border-border bg-muted px-2 font-mono text-xs font-medium text-foreground">
              Enter
            </kbd>
            to start a new test
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
