import * as cheerio from "npm:cheerio";
import { subjectCodes } from "./sections.js";

export async function scrape() {
    const sections = new Set();
    for (const subjectCode of subjectCodes) {
    const form = new FormData();

    form.append("CAMPUS", "0");
    form.append("TERMYEAR", "202601");
    form.append("CORE_CODE	", "AR%");
    form.append("subj_code", subjectCode); // loop through each subject
    form.append("SCHDTYPE", "%");
    form.append("CRSE_NUMBER", "");
    form.append("crn", "");
    form.append("open_only", "on"); // ""
    form.append("BTN_PRESSED", "FIND+class+sections");
    form.append("inst_name", "");

    const res = await fetch(
        "https://apps.es.vt.edu/ssb/HZSKVTSC.P_ProcRequest",
        {
            method: "POST",
            body: form,
        },
    );

    const html = await res.text();

    const $ = cheerio.load(html);
    const rows = $(".dataentrytable tbody").children();

    for (let i = 1; i < rows.length; i++) { // Start from 2nd element since 1st row is title
        const cols = $(rows[i]).children().toArray().map((v) =>
            $(v).text().trim()
        );
        if (cols[0].length != 5) continue; // Check if first col is CRN or fake row
        sections.add({
            crn: cols[0],
            class: cols[1],
            title: cols[2],
        });
    }
  }

    return sections;
}
