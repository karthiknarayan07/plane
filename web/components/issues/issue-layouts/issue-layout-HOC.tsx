import { observer } from "mobx-react";
import {
  CalendarLayoutLoader,
  GanttLayoutLoader,
  KanbanLayoutLoader,
  ListLayoutLoader,
  SpreadsheetLayoutLoader,
} from "@/components/ui";
import { EIssueLayoutTypes } from "@/constants/issue";
import { useIssues } from "@/hooks/store";
import { useIssueStore } from "@/hooks/use-issue-layout-store";
import { IssueLayoutEmptyState } from "./empty-states";

const ActiveLoader = (props: { layout: EIssueLayoutTypes }) => {
  const { layout } = props;
  switch (layout) {
    case EIssueLayoutTypes.LIST:
      return <ListLayoutLoader />;
    case EIssueLayoutTypes.KANBAN:
      return <KanbanLayoutLoader />;
    case EIssueLayoutTypes.SPREADSHEET:
      return <SpreadsheetLayoutLoader />;
    case EIssueLayoutTypes.CALENDAR:
      return <CalendarLayoutLoader />;
    case EIssueLayoutTypes.GANTT:
      return <GanttLayoutLoader />;
    default:
      return null;
  }
};

interface Props {
  children: string | JSX.Element | JSX.Element[];
  layout: EIssueLayoutTypes;
}

export const IssueLayoutHOC = observer((props: Props) => {
  const { layout } = props;

  const storeType = useIssueStore();
  const { issues } = useIssues(storeType);

  const issueCount = issues.getGroupIssueCount(undefined, undefined, false);

  if (issues?.loader === "init-loader" || issueCount === undefined) {
    return <ActiveLoader layout={layout} />;
  }

  if (issues.getGroupIssueCount(undefined, undefined, false) === 0) {
    return <IssueLayoutEmptyState storeType={storeType} />;
  }

  return <>{props.children}</>;
});
