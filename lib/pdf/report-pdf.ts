import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer
} from "@react-pdf/renderer";
import { createElement } from "react";
import type { FinalReport, Scenario } from "@/lib/types";
import { buildModelDialogue } from "@/lib/model-dialogue";

const colors = {
  ink: "#111111",
  forest: "#0F5132",
  tomato: "#C9342F",
  paper: "#F6F1E7",
  muted: "#5b5b5b",
  border: "#dcd8cf"
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    lineHeight: 1.4,
    color: colors.ink,
    fontFamily: "Helvetica"
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: `1pt solid ${colors.border}`
  },
  eyebrow: {
    fontSize: 9,
    color: colors.forest,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4
  },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  meta: { fontSize: 10, color: colors.muted },
  scoreBlock: {
    backgroundColor: colors.ink,
    color: "#fff",
    padding: 16,
    borderRadius: 6,
    marginBottom: 18
  },
  scoreBig: { fontSize: 38, fontFamily: "Helvetica-Bold", color: "#fff" },
  scoreLabel: { fontSize: 10, color: "#ddd" },
  summary: { color: "#fff", fontSize: 11, marginTop: 8, lineHeight: 1.45 },
  section: { marginBottom: 16 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  rowLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  rowValue: { fontSize: 10, color: colors.muted },
  bar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 8
  },
  barFill: {
    height: 4,
    backgroundColor: colors.forest,
    borderRadius: 2
  },
  bullet: { marginBottom: 4, fontSize: 10 },
  moment: {
    borderTop: `1pt solid ${colors.border}`,
    paddingTop: 8,
    marginTop: 8
  },
  momentLabel: {
    fontSize: 9,
    color: colors.tomato,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 4
  },
  quote: { fontSize: 10, color: colors.muted, marginBottom: 2 },
  better: { fontSize: 10, marginTop: 4 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 8,
    color: colors.muted,
    textAlign: "center"
  }
});

type Props = {
  report: FinalReport;
  scenario?: Scenario;
  scenarioTitle: string;
  pseudo: string;
  createdAt: string;
};

function ReportDocument({
  report,
  scenario,
  scenarioTitle,
  pseudo,
  createdAt
}: Props) {
  const modelDialogue =
    scenario && report.discoveryReview
      ? buildModelDialogue(scenario, report.discoveryReview)
      : [];
  const skills: Array<[string, number, number]> = [
    ["Decouverte", report.score.decouverte, 15],
    ["Mensualites / Cpay", report.score.financement, 25],
    ["GLD (garantie)", report.score.garantieExtension, 25],
    ["Estaly / pertinence", report.score.assuranceEsthetisme, 25],
    ["Objections services", report.score.objections, 5],
    ["Closing services", report.score.closing, 5]
  ];

  const dateFr = new Date(createdAt).toLocaleString("fr-FR");

  return createElement(
    Document,
    {},
    createElement(
      Page,
      { size: "A4", style: styles.page },
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.eyebrow }, "Rapport de session"),
        createElement(Text, { style: styles.title }, scenarioTitle),
        createElement(
          Text,
          { style: styles.meta },
          `${pseudo} - ${dateFr}`
        )
      ),
      createElement(
        View,
        { style: styles.scoreBlock },
        createElement(Text, { style: styles.scoreLabel }, "Score global"),
        createElement(Text, { style: styles.scoreBig }, `${report.score.global}/100`),
        createElement(Text, { style: styles.summary }, report.summary)
      ),
      createElement(
        View,
        { style: styles.section },
        createElement(Text, { style: styles.h2 }, "Competences"),
        ...skills.map(([label, value, max]) =>
          createElement(
            View,
            { key: label },
            createElement(
              View,
              { style: styles.row },
              createElement(Text, { style: styles.rowLabel }, label),
              createElement(Text, { style: styles.rowValue }, `${value}/${max}`)
            ),
            createElement(
              View,
              { style: styles.bar },
              createElement(View, {
                style: {
                  ...styles.barFill,
                  width: `${Math.min(100, Math.round((value / max) * 100))}%`
                }
              })
            )
          )
        )
      ),
      report.discoveryReview &&
        createElement(
          View,
          { style: styles.section },
          createElement(
            Text,
            { style: styles.h2 },
            `Signaux captes / manques (${report.discoveryReview.capturedCount}/${report.discoveryReview.signals.length})`
          ),
          ...report.discoveryReview.signals.map((signal, index) =>
            createElement(
              Text,
              { key: `sig-${index}`, style: styles.bullet },
              `${signal.exploited ? "[capte]" : "[manque]"} "${signal.clientQuote}"`
            )
          ),
          ...report.discoveryReview.services.map((service, index) =>
            createElement(
              Text,
              { key: `svc-${index}`, style: styles.bullet },
              `- ${service.reason}`
            )
          )
        ),
      report.score.strengths.length > 0 &&
        createElement(
          View,
          { style: styles.section },
          createElement(Text, { style: styles.h2 }, "Bien joue"),
          ...report.score.strengths.map((item, index) =>
            createElement(Text, { key: index, style: styles.bullet }, `- ${item}`)
          )
        ),
      report.score.priorities.length > 0 &&
        createElement(
          View,
          { style: styles.section },
          createElement(Text, { style: styles.h2 }, "Priorites - bons reflexes"),
          ...report.score.priorities
            .slice(0, 3)
            .map((item, index) =>
              createElement(
                Text,
                { key: index, style: styles.bullet },
                `- ${item}`
              )
            )
        ),
      report.keyMoments.length > 0 &&
        createElement(
          View,
          { style: styles.section },
          createElement(Text, { style: styles.h2 }, "Moments cles"),
          ...report.keyMoments.map((moment, index) =>
            createElement(
              View,
              { key: index, style: styles.moment },
              createElement(Text, { style: styles.momentLabel }, "Moment"),
              moment.clientQuote &&
                createElement(
                  Text,
                  { style: styles.quote },
                  `Client : "${moment.clientQuote}"`
                ),
              moment.sellerQuote &&
                createElement(
                  Text,
                  { style: styles.quote },
                  `Vous : "${moment.sellerQuote}"`
                ),
              moment.betterAnswer &&
                createElement(
                  Text,
                  { style: styles.better },
                  `Mieux : ${moment.betterAnswer}`
                )
            )
          )
        ),
      modelDialogue.length > 0 &&
        createElement(
          View,
          { style: styles.section },
          createElement(Text, { style: styles.h2 }, "Comment un pro aurait fait"),
          ...modelDialogue.map((exchange, index) =>
            createElement(
              View,
              { key: `model-${index}`, style: styles.moment },
              createElement(
                Text,
                { style: styles.momentLabel },
                exchange.missed ? `${exchange.note} (rate)` : exchange.note
              ),
              createElement(
                Text,
                { style: styles.quote },
                `Client : "${exchange.client}"`
              ),
              createElement(
                Text,
                { style: styles.better },
                `Pro : ${exchange.expert}`
              )
            )
          )
        ),
      report.spacedPlan.length > 0 &&
        createElement(
          View,
          { style: styles.section },
          createElement(Text, { style: styles.h2 }, "A retravailler plus tard"),
          ...report.spacedPlan.map((item, index) =>
            createElement(
              Text,
              { key: index, style: styles.bullet },
              `${item.when} : ${item.task}`
            )
          )
        ),
      createElement(
        Text,
        { style: styles.footer },
        "Coach Vente - app anonyme d'entrainement. Aucun audio conserve."
      )
    )
  );
}

export async function renderReportPdf(props: Props): Promise<Buffer> {
  // Construire l'arbre directement pour satisfaire le typage strict de renderToBuffer.
  return renderToBuffer(ReportDocument(props));
}
