import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Eye, X } from "lucide-react";
import {
  collabTutorialSamples,
  dismissTutorial,
  type TutorialGroup,
} from "@/lib/collabTutorialSamples";

interface Props {
  onDismiss: () => void;
}

export const TutorialPreview = ({ onDismiss }: Props) => {
  const [preview, setPreview] = useState<TutorialGroup | null>(null);

  const handleDismiss = () => {
    dismissTutorial();
    onDismiss();
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Example preview</Badge>
          <p className="text-sm text-muted-foreground">
            Not saved to your account.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="gap-2 text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Dismiss examples
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {collabTutorialSamples.map((g) => (
          <Card
            key={g.id}
            className="border border-dashed border-border bg-card/60"
          >
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {g.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {g.blurb}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => setPreview(g)}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
            <DialogDescription>{preview?.blurb}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/90">
            <p>
              <strong>Members:</strong> everyone you invite shows up here with
              their role (Owner / Member).
            </p>
            <p>
              <strong>Invites:</strong> owners send invites by email — invitees
              accept via a one-time link.
            </p>
            <p>
              <strong>Shared board:</strong> the group gets its own collaborative
              kanban (shipping in Phase 3).
            </p>
            <p className="text-muted-foreground">
              This preview is read-only and isn't saved to your account.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPreview(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
