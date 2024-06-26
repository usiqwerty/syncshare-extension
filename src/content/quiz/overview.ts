import Log from "../../shared/debug/log";
//import browser from "webextension-polyfill";
import MultiSource from "../../shared/utils/MultiSource";
import BreadcrumbSource from "./sources/BreadcrumbSource";
import URLSource from "./sources/quiz/URLSource";

const page = new MultiSource(
    [new BreadcrumbSource(),
    new URLSource()]
);

const quizId = page.get("quizId");

// Check if page can be served
let supported = true;

if (!quizId) {
    throw new Error("OverviewPage: NotSupported: Missing required parameters");
}

Log.info("OverviewPage: Check passed");

chrome.runtime.sendMessage({ //browser
    type: "overview-page-open",
    payload: { quizId }
});

const submitBtn = document.querySelector("form[action*=\"processattempt.php\"] > button[type=\"submit\"]");

submitBtn.addEventListener("click", event => {
    setTimeout(() => {
        const dialog = document.querySelector("div.confirmation-dialogue");

        if (!dialog) {
            Log.error(null, "OverviewPage: Failed to capture submit button");
            return;
        }

        const confirmBtn = dialog.querySelector("input[type=\"button\"].btn.btn-primary");

        confirmBtn.addEventListener("click", event => {
            chrome.runtime.sendMessage({ //browser
                type: "btn-submit-attempt",
                payload: { quizId }
            });
        });
    }, 500);
});