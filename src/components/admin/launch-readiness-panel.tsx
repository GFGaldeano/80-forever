import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

import type {
  LaunchReadinessCheck,
  LaunchReadinessReport,
} from "@/lib/readiness/build-launch-readiness-report";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LaunchReadinessPanelProps = {
  report: LaunchReadinessReport;
};

function getStatusBadgeClass(status: LaunchReadinessReport["overallStatus"]) {
  switch (status) {
    case "ready":
      return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "critical":
      return "border border-red-500/30 bg-red-500/10 text-red-300";
    case "warning":
    default:
      return "border border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
}

function getStatusLabel(status: LaunchReadinessReport["overallStatus"]) {
  switch (status) {
    case "ready":
      return "Lista";
    case "critical":
      return "Crítica";
    case "warning":
    default:
      return "Con observaciones";
  }
}

function getCheckIcon(status: LaunchReadinessCheck["status"]) {
  switch (status) {
    case "ready":
      return CheckCircle2;
    case "critical":
      return ShieldAlert;
    case "warning":
    default:
      return AlertTriangle;
  }
}

function getCheckAccent(status: LaunchReadinessCheck["status"]) {
  switch (status) {
    case "ready":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "critical":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "warning":
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
}

function CheckList({
  title,
  items,
}: {
  title: string;
  items: LaunchReadinessCheck[];
}) {
  return (
    <Card className="border-white/10 bg-zinc-950/80 text-white">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((item) => {
          const Icon = getCheckIcon(item.status);

          return (
            <div
              key={item.key}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`inline-flex rounded-xl border p-2 ${getCheckAccent(
                    item.status
                  )}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{item.label}</p>
                    <Badge className={getCheckAccent(item.status)}>
                      {item.status === "ready"
                        ? "OK"
                        : item.status === "critical"
                        ? "Crítico"
                        : "Atención"}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.detail}
                  </p>

                  {item.recommendation ? (
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      Recomendación: {item.recommendation}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function LaunchReadinessPanel({
  report,
}: Readonly<LaunchReadinessPanelProps>) {
  return (
    <section className="space-y-6">
      <Card className="border-white/10 bg-zinc-950/80 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Stethoscope className="h-5 w-5 text-cyan-300" />
            Launch readiness
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Estado de preparación técnica y operativa para salida pública.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={getStatusBadgeClass(report.overallStatus)}>
              {getStatusLabel(report.overallStatus)}
            </Badge>

            <Badge className="border border-white/10 bg-white/[0.03] text-zinc-300">
              Score: {report.score}%
            </Badge>

            <Badge className="border border-white/10 bg-white/[0.03] text-zinc-300">
              {report.readyCount}/{report.totalChecks} checks listos
            </Badge>
          </div>

          {report.recommendations.length ? (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              <p className="font-medium">Próximos pasos sugeridos</p>
              <ul className="mt-3 space-y-2">
                {report.recommendations.slice(0, 4).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              La plataforma quedó bien posicionada para operar y publicar.
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
            >
              <Link href="/admin/settings">
                Ir a configuración
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
            >
              <Link href="/admin/stream">
                Revisar stream
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
            >
              <Link href="/admin/transmissions">
                Revisar transmisiones
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200"
            >
              <a href="/api/health" target="_blank" rel="noreferrer">
                Ver health
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <CheckList title="Infraestructura y entorno" items={report.envChecks} />
        <CheckList title="Contenido y operación" items={report.contentChecks} />
      </div>
    </section>
  );
}