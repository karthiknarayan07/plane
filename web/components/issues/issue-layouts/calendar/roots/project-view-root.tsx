import { observer } from "mobx-react-lite";
// hooks
import { ProjectIssueQuickActions } from "@/components/issues";
// components
// types
import { BaseCalendarRoot } from "../base-calendar-root";
// constants

export const ProjectViewCalendarLayout: React.FC = observer(() => (
  <BaseCalendarRoot QuickActions={ProjectIssueQuickActions} />
));
