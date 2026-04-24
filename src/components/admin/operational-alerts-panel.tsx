import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import type {
  OperationalAlert,
  OperationalAlertSeverity,
} from "@/lib/automation/build-operational-alerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OperationalAlertsPanelProps = {
  alerts: OperationalAlert[];
};

function getSeverityBadgeClass(severity: OperationalAlertSeverity) {
  switch (severity) {
    case "critical":
      return "border border-red-500/30 bg-red-500/10 text-red-300";
    case "warning":
      return "border border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "info":
    default:
      return "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  }
}

function getSeverityLabel(severity: OperationalAlertSeverity) {
  switch (severity) {
    case "critical":
      return "Crítico";
    case "warning":
      return "Atención";
    case "info":
    default:
      return "Info";
  }
}

function getSeverityIcon(severity: OperationalAlertSeverity) {
  switch (severity) {
    case "critical":
      return ShieldAlert;
    case "warning":
      return AlertTriangle;
    case "info":
    default:
      return BellRing;
  }
}

export function OperationalAlertsPanel({
  alerts,
}: Readonly<OperationalAlertsPanelProps>) {
  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <BellRing className="h-5 w-5 text-cyan-300" />
          Atención operativa
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Base inicial de alertas internas del panel, preparada para futuras automatizaciones.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {alerts.length ? (
          alerts.map((alert) => {
            const Icon = getSeverityIcon(alert.severity);

            return (
              <div
                key={alert.key}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`inline-flex rounded-xl border p-2 ${getSeverityBadgeClass(
                      alert.severity
                    )}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{alert.title}</p>
                      <Badge className={getSeverityBadgeClass(alert.severity)}>
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {alert.description}
                    </p>

                    {alert.actionHref && alert.actionLabel ? (
                      <div className="mt-4">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                        >
                          <Link href={alert.actionHref}>
                            {alert.actionLabel}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p>
                No se detectaron alertas operativas en este momento. La base está lista
                para evolucionar a recordatorios y automatizaciones futuras.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}