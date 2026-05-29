import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import type { Group } from "@/lib/groupsApi";

interface Props {
  group: Group;
}

export const GroupCard = ({ group }: Props) => {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate(`/groups/${group.id}`);
  };

  let createdLabel = "";
  try {
    createdLabel = `Created ${format(parseISO(group.createdAt), "MMM d, yyyy")}`;
  } catch {
    createdLabel = "";
  }

  return (
    <Card className="border border-border bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
            {createdLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{createdLabel}</p>
            )}
          </div>
        </div>
        <Button onClick={handleEnter} className="w-full gap-2" variant="secondary">
          Enter group
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
