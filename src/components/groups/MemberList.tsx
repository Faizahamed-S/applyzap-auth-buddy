import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, User as UserIcon } from "lucide-react";
import type { GroupMember } from "@/lib/groupsApi";

interface Props {
  members: GroupMember[];
}

export const MemberList = ({ members }: Props) => {
  if (!members?.length) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No members yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-0 divide-y divide-border">
        {members.map((m) => {
          const isOwner = m.role === "OWNER";
          return (
            <div
              key={m.memberId}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={
                    "h-9 w-9 rounded-full flex items-center justify-center shrink-0 " +
                    (isOwner
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {isOwner ? (
                    <Crown className="h-4 w-4" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </div>
                <p className="font-medium text-foreground truncate">
                  {m.displayName}
                </p>
              </div>
              <Badge variant={isOwner ? "default" : "secondary"}>
                {isOwner ? "Owner" : "Member"}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
