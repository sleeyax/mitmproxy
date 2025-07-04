import type { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "web/ducks/hooks";
import type { Flow } from "web/flow";
import {
  canReplay,
  endTime,
  getMethod,
  getTotalSize,
  getVersion,
  mainPath,
  startTime,
} from "web/flow/utils";
import { Badge } from "@/components/ui/badge";
import { formatSize, formatTimeDelta, formatTimeStamp } from "web/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import * as flowActions from "web/ducks/flows";
import {
  LuBookmark,
  LuCircleAlert,
  LuLock,
  LuLockOpen,
  LuOctagonX,
  LuPause,
  LuRotateCw,
} from "react-icons/lu";
import type { ReactNode } from "react";
import { ContentTypeIcon } from "@/components/content-type-icon";
import { MethodBadge } from "@/components/method-badge";

export const columns: ColumnDef<Flow>[] = [
  {
    id: "index",
    accessorKey: "index",
    header: "#",
    size: 10,
    minSize: 20,
    maxSize: 40,
    cell: function CellComponent({ row }) {
      const index = useAppSelector((state) =>
        state.flows._listIndex.get(row.original.id),
      );

      return <span className="text-muted-foreground">{(index ?? 0) + 1}</span>;
    },
  },
  {
    id: "tls",
    header: "TLS",
    size: 20,
    cell: function CellComponent({ row }) {
      const isTLS = row.original.client_conn.tls_established;

      return (
        <div title={isTLS ? "Client TLS connection established" : "No TLS"}>
          {isTLS ? (
            <LuLock className="text-muted-foreground size-4" />
          ) : (
            <LuLockOpen className="text-muted-foreground size-4" />
          )}
        </div>
      );
    },
  },
  {
    id: "icon",
    header: "Type",
    size: 10,
    minSize: 10,
    maxSize: 40,
    cell: function CellComponent({ row }) {
      return <ContentTypeIcon flow={row.original} />;
    },
  },
  {
    id: "path",
    header: "Path",
    size: 300,
    minSize: 150,
    maxSize: 500,
    cell: function CellComponent({ row: { original: flow } }) {
      const icons: ReactNode[] = [];

      if (flow.is_replay) {
        icons.push(
          <div key="replay" title="Replayed flow">
            <LuRotateCw className="size-4 text-blue-500" />
          </div>,
        );
      }

      if (flow.intercepted) {
        icons.push(
          <div key="pause" title="Intercepted flow">
            <LuPause className="size-4 text-yellow-500" />
          </div>,
        );
      }

      if (flow.error) {
        icons.push(
          <div
            key="error"
            title={`Error: ${flow.error.msg || "unknown connection error"}`}
          >
            {flow.error.msg === "Connection killed." ? (
              <LuOctagonX className="size-4 text-red-500" />
            ) : (
              <LuCircleAlert className="size-4 text-red-500" />
            )}
          </div>,
        );
      }

      if (flow.marked) {
        icons.push(
          <div key="marked" title={`Marked with ${flow.marked}`}>
            <LuBookmark className="size-4 text-yellow-300" />
          </div>,
        );
      }

      const iconCount = icons.length;
      const dynamicPaddingRight = iconCount > 0 ? iconCount * 20 : 0;

      return (
        <div className="relative">
          <span
            className="block truncate"
            style={{ paddingRight: `${dynamicPaddingRight}px` }}
          >
            {mainPath(flow)}
          </span>

          <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-1">
            {icons}
          </div>
        </div>
      );
    },
  },
  {
    id: "method",
    header: "Method",
    size: 70,
    minSize: 60,
    maxSize: 80,
    cell: function CellComponent({ row }) {
      return <MethodBadge method={getMethod(row.original)} />;
    },
  },
  {
    id: "version",
    header: "Version",
    size: 80,
    minSize: 60,
    maxSize: 100,
    cell: function CellComponent({ row }) {
      return getVersion(row.original);
    },
  },
  {
    id: "status",
    header: "Status",
    size: 70,
    minSize: 60,
    maxSize: 80,
    cell: function CellComponent({ row }) {
      const flow = row.original;

      if (flow.type === "dns" && flow.response) {
        return <Badge>{flow.response.response_code}</Badge>;
      }

      if (flow.type === "http" && flow.response) {
        return <StatusBadge code={flow.response.status_code} />;
      }

      return null;
    },
  },
  {
    id: "size",
    header: "Size",
    size: 80,
    minSize: 70,
    maxSize: 100,
    cell: function CellComponent({ row }) {
      return formatSize(getTotalSize(row.original));
    },
  },
  {
    id: "time",
    header: "Time",
    size: 80,
    minSize: 70,
    maxSize: 100,
    cell: function CellComponent({ row }) {
      const start = startTime(row.original);
      const end = endTime(row.original);

      return start && end ? formatTimeDelta(1000 * (end - start)) : "...";
    },
  },
  {
    id: "timestamp",
    header: "Timestamp",
    size: 150,
    minSize: 120,
    maxSize: 180,
    cell: function CellComponent({ row }) {
      const time = startTime(row.original);

      return time ? formatTimeStamp(time) : "...";
    },
  },
  {
    id: "quickactions",
    header: "Actions",
    size: 90,
    minSize: 80,
    maxSize: 120,
    cell: function CellComponent({ row }) {
      const dispatch = useAppDispatch();
      const flow = row.original;

      if (flow.intercepted) {
        return (
          <Button
            size="sm"
            onClick={() => void dispatch(flowActions.resume([flow]))}
          >
            Resume
          </Button>
        );
      }

      if (canReplay(flow)) {
        return (
          <Button
            size="sm"
            onClick={() => void dispatch(flowActions.replay([flow]))}
          >
            Replay
          </Button>
        );
      }

      return null;
    },
  },
  {
    id: "comment",
    header: "Comment",
    size: 200,
    minSize: 100,
    maxSize: 300,
    cell: function CellComponent({ row }) {
      const text = row.original.comment;

      return text;
    },
  },
];
