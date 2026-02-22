import { Bell } from "lucide-react";
import { mockAnnouncements } from "./mockData";

const AnnouncementsTab = () => (
  <div className="space-y-4">
    {mockAnnouncements.map((a) => (
      <div
        key={a.id}
        className="glass rounded-xl p-5 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Bell className="h-4 w-4 text-primary mt-1 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{a.title}</h3>
                {a.isNew && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {a.message}
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {a.timestamp}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default AnnouncementsTab;