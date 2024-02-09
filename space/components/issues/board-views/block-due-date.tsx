"use client";

// helpers
import { renderFullDate } from "helpers/date-time.helper";

export const dueDateIconDetails = (
  date: string,
  stateGroup: string
): {
  iconName: string;
  className: string;
} => {
  let iconName = "calendar_today";
  let className = "";

  if (!date || ["completed", "cancelled"].includes(stateGroup)) {
    iconName = "calendar_today";
    className = "";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const timeDifference = targetDate.getTime() - today.getTime();

    if (timeDifference < 0) {
      iconName = "event_busy";
      className = "text-danger-text-medium";
    } else if (timeDifference === 0) {
      iconName = "today";
      className = "text-danger-text-medium";
    } else if (timeDifference === 24 * 60 * 60 * 1000) {
      iconName = "event";
      className = "text-warning-text-subtle";
    } else {
      iconName = "calendar_today";
      className = "";
    }
  }

  return {
    iconName,
    className,
  };
};

export const IssueBlockDueDate = ({ due_date, group }: { due_date: string; group: string }) => {
  const iconDetails = dueDateIconDetails(due_date, group);

  return (
    <div className="flex items-center gap-1 rounded border-[0.5px] border-neutral-border-medium px-2.5 py-1 text-xs text-neutral-text-strong">
      <span className={`material-symbols-rounded -my-0.5 text-sm ${iconDetails.className}`}>
        {iconDetails.iconName}
      </span>
      {renderFullDate(due_date)}
    </div>
  );
};
