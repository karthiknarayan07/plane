import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useRouter } from "next/router";
// hooks
// components
import { ArrowRight, Plus, PanelRight } from "lucide-react";
import { IIssueDisplayFilterOptions, IIssueDisplayProperties, IIssueFilterOptions, TIssueLayouts } from "@plane/types";
import { Breadcrumbs, Button, ContrastIcon, CustomMenu, Tooltip } from "@plane/ui";
import { ProjectAnalyticsModal } from "@/components/analytics";
import { BreadcrumbLink } from "@/components/common";
import { DisplayFiltersSelection, FiltersDropdown, FilterSelection, LayoutSelection } from "@/components/issues";
import { ProjectLogo } from "@/components/project";
import { EIssueFilterType, EIssuesStoreType, ISSUE_DISPLAY_FILTERS_BY_LAYOUT } from "@/constants/issue";
import { EUserProjectRoles } from "@/constants/project";
import { cn } from "@/helpers/common.helper";
import { truncateText } from "@/helpers/string.helper";
import {
  useEventTracker,
  useCycle,
  useLabel,
  useMember,
  useProject,
  useProjectState,
  useUser,
  useIssues,
  useCommandPalette,
} from "@/hooks/store";
import useLocalStorage from "@/hooks/use-local-storage";
// ui
// icons
// helpers
// types
import { usePlatformOS } from "@/hooks/use-platform-os";
// constants

const CycleDropdownOption: React.FC<{ cycleId: string }> = ({ cycleId }) => {
  // router
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  // store hooks
  const { getCycleById } = useCycle();
  // derived values
  const cycle = getCycleById(cycleId);
  //

  if (!cycle) return null;

  return (
    <CustomMenu.MenuItem key={cycle.id}>
      <Link href={`/${workspaceSlug}/projects/${projectId}/cycles/${cycle.id}`} className="flex items-center gap-1.5">
        <ContrastIcon className="h-3 w-3" />
        {truncateText(cycle.name, 40)}
      </Link>
    </CustomMenu.MenuItem>
  );
};

export const CycleIssuesHeader: React.FC = observer(() => {
  // states
  const [analyticsModal, setAnalyticsModal] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug, projectId, cycleId } = router.query as {
    workspaceSlug: string;
    projectId: string;
    cycleId: string;
  };
  // store hooks
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(EIssuesStoreType.CYCLE);
  const { currentProjectCycleIds, getCycleById } = useCycle();
  const { toggleCreateIssueModal } = useCommandPalette();
  const { setTrackElement } = useEventTracker();
  const {
    membership: { currentProjectRole },
  } = useUser();
  const { currentProjectDetails } = useProject();
  const { projectStates } = useProjectState();
  const { projectLabels } = useLabel();
  const {
    project: { projectMemberIds },
  } = useMember();
  const { isMobile } = usePlatformOS();

  const activeLayout = issueFilters?.displayFilters?.layout;

  const { setValue, storedValue } = useLocalStorage("cycle_sidebar_collapsed", "false");

  const isSidebarCollapsed = storedValue ? (storedValue === "true" ? true : false) : false;
  const toggleSidebar = () => {
    setValue(`${!isSidebarCollapsed}`);
  };

  const handleLayoutChange = useCallback(
    (layout: TIssueLayouts) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, { layout: layout }, cycleId);
    },
    [workspaceSlug, projectId, cycleId, updateFilters]
  );

  const handleFiltersUpdate = useCallback(
    (key: keyof IIssueFilterOptions, value: string | string[]) => {
      if (!workspaceSlug || !projectId) return;
      const newValues = issueFilters?.filters?.[key] ?? [];

      if (Array.isArray(value)) {
        // this validation is majorly for the filter start_date, target_date custom
        value.forEach((val) => {
          if (!newValues.includes(val)) newValues.push(val);
          else newValues.splice(newValues.indexOf(val), 1);
        });
      } else {
        if (issueFilters?.filters?.[key]?.includes(value)) newValues.splice(newValues.indexOf(value), 1);
        else newValues.push(value);
      }

      updateFilters(workspaceSlug, projectId, EIssueFilterType.FILTERS, { [key]: newValues }, cycleId);
    },
    [workspaceSlug, projectId, cycleId, issueFilters, updateFilters]
  );

  const handleDisplayFilters = useCallback(
    (updatedDisplayFilter: Partial<IIssueDisplayFilterOptions>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_FILTERS, updatedDisplayFilter, cycleId);
    },
    [workspaceSlug, projectId, cycleId, updateFilters]
  );

  const handleDisplayProperties = useCallback(
    (property: Partial<IIssueDisplayProperties>) => {
      if (!workspaceSlug || !projectId) return;
      updateFilters(workspaceSlug, projectId, EIssueFilterType.DISPLAY_PROPERTIES, property, cycleId);
    },
    [workspaceSlug, projectId, cycleId, updateFilters]
  );

  // derived values
  const cycleDetails = cycleId ? getCycleById(cycleId.toString()) : undefined;
  const canUserCreateIssue =
    currentProjectRole && [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER].includes(currentProjectRole);

  const issueCount = cycleDetails
    ? issueFilters?.displayFilters?.sub_issue && cycleDetails?.sub_issues
      ? cycleDetails.total_issues + cycleDetails?.sub_issues
      : cycleDetails.total_issues
    : undefined;

  return (
    <>
      <ProjectAnalyticsModal
        isOpen={analyticsModal}
        onClose={() => setAnalyticsModal(false)}
        cycleDetails={cycleDetails ?? undefined}
      />
      <div className="relative z-[15] w-full items-center gap-x-2 gap-y-4">
        <div className="flex justify-between bg-custom-sidebar-background-100 p-4">
          <div className="flex items-center gap-2">
            <Breadcrumbs onBack={router.back}>
              <Breadcrumbs.BreadcrumbItem
                type="text"
                link={
                  <span>
                    <span className="hidden md:block">
                      <BreadcrumbLink
                        label={currentProjectDetails?.name ?? "Project"}
                        href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                        icon={
                          currentProjectDetails && (
                            <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
                              <ProjectLogo logo={currentProjectDetails?.logo_props} className="text-sm" />
                            </span>
                          )
                        }
                      />
                    </span>
                    <Link
                      href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/issues`}
                      className="block pl-2 text-custom-text-300 md:hidden"
                    >
                      ...
                    </Link>
                  </span>
                }
              />
              <Breadcrumbs.BreadcrumbItem
                type="text"
                link={
                  <BreadcrumbLink
                    label="Cycles"
                    href={`/${workspaceSlug}/projects/${projectId}/cycles`}
                    icon={<ContrastIcon className="h-4 w-4 text-custom-text-300" />}
                  />
                }
              />
              <Breadcrumbs.BreadcrumbItem
                type="component"
                component={
                  <CustomMenu
                    label={
                      <>
                        <ContrastIcon className="h-3 w-3" />
                        <div className="flex w-auto max-w-[70px] items-center gap-2 truncate sm:max-w-[200px]">
                          <p className="truncate">{cycleDetails?.name && cycleDetails.name}</p>
                          {issueCount && issueCount > 0 ? (
                            <Tooltip
                              isMobile={isMobile}
                              tooltipContent={`There are ${issueCount} ${
                                issueCount > 1 ? "issues" : "issue"
                              } in this cycle`}
                              position="bottom"
                            >
                              <span className="flex flex-shrink-0 cursor-default items-center justify-center rounded-xl bg-custom-primary-100/20 px-2 text-center text-xs font-semibold text-custom-primary-100">
                                {issueCount}
                              </span>
                            </Tooltip>
                          ) : null}
                        </div>
                      </>
                    }
                    className="ml-1.5 flex-shrink-0 truncate"
                    placement="bottom-start"
                  >
                    {currentProjectCycleIds?.map((cycleId) => (
                      <CycleDropdownOption key={cycleId} cycleId={cycleId} />
                    ))}
                  </CustomMenu>
                }
              />
            </Breadcrumbs>
          </div>
          <div className="hidden items-center gap-2 md:flex ">
            <LayoutSelection
              layouts={["list", "kanban", "calendar", "spreadsheet", "gantt_chart"]}
              onChange={(layout) => handleLayoutChange(layout)}
              selectedLayout={activeLayout}
            />
            <FiltersDropdown title="Filters" placement="bottom-end">
              <FilterSelection
                filters={issueFilters?.filters ?? {}}
                handleFiltersUpdate={handleFiltersUpdate}
                layoutDisplayFiltersOptions={
                  activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
                }
                labels={projectLabels}
                memberIds={projectMemberIds ?? undefined}
                states={projectStates}
                cycleViewDisabled={!currentProjectDetails?.cycle_view}
                moduleViewDisabled={!currentProjectDetails?.module_view}
              />
            </FiltersDropdown>
            <FiltersDropdown title="Display" placement="bottom-end">
              <DisplayFiltersSelection
                layoutDisplayFiltersOptions={
                  activeLayout ? ISSUE_DISPLAY_FILTERS_BY_LAYOUT.issues[activeLayout] : undefined
                }
                displayFilters={issueFilters?.displayFilters ?? {}}
                handleDisplayFiltersUpdate={handleDisplayFilters}
                displayProperties={issueFilters?.displayProperties ?? {}}
                handleDisplayPropertiesUpdate={handleDisplayProperties}
                ignoreGroupedFilters={["cycle"]}
                cycleViewDisabled={!currentProjectDetails?.cycle_view}
                moduleViewDisabled={!currentProjectDetails?.module_view}
              />
            </FiltersDropdown>

            {canUserCreateIssue && (
              <>
                <Button onClick={() => setAnalyticsModal(true)} variant="neutral-primary" size="sm">
                  Analytics
                </Button>
                <Button
                  onClick={() => {
                    setTrackElement("Cycle issues page");
                    toggleCreateIssueModal(true, EIssuesStoreType.CYCLE);
                  }}
                  size="sm"
                  prependIcon={<Plus />}
                >
                  Add Issue
                </Button>
              </>
            )}
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded p-1 outline-none hover:bg-custom-sidebar-background-80"
              onClick={toggleSidebar}
            >
              <ArrowRight className={`h-4 w-4 duration-300 ${isSidebarCollapsed ? "-rotate-180" : ""}`} />
            </button>
          </div>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded p-1 outline-none hover:bg-custom-sidebar-background-80 md:hidden"
            onClick={toggleSidebar}
          >
            <PanelRight className={cn("h-4 w-4", !isSidebarCollapsed ? "text-[#3E63DD]" : "text-custom-text-200")} />
          </button>
        </div>
      </div>
    </>
  );
});
