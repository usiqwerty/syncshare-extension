import Question from "../../../content/quiz/questions/Question";
import * as Images from "../../../shared/utils/images";
import * as Strings from "../../../shared/utils/strings";
import MagicButton from "../../../shared/widgets/MagicButton";
import {WidgetAnchor} from "../solver/types";

class Match extends Question {
    labels: {};
    private readonly options: {};
    container: any;
    questionType: string;

    constructor(args) {
        super(args);

        const table = this.container.querySelector("table.answer");
        const stems = table.querySelectorAll("td.text");
        const selects = table.querySelectorAll("td.control > select");

        this.labels = {};
        this.options = {};
        this.questionType = "match";

        for (const option of selects[0].childNodes) {
            this.options[option.innerText] = option.value;
        }

        for (let i = 0; i < stems.length; i++) {
            const stem = stems[i];
            const select = selects[i];

            let sign = [
                Strings.removeInvisible(stem.innerText) || "[NO TEXT]",
                Images.serializeArray(stem.querySelectorAll("img"))
            ];
            if (!sign[1])
                sign.pop();
            this.labels[sign.join(";")] = select;
        }
    }

    createWidgetAnchor(anchor_list: string[]): WidgetAnchor {
        const anchor = anchor_list[0];
        let select = this.labels[anchor];//.sign
        // Try to find similar nodes in case 
        // the text of the question has changed
        if (!select) {
            const candidate = Strings.findSimilar(anchor, Object.keys(this.labels));//.sign

            if (!candidate) {
                return;
            }

            select = this.labels[candidate];
        }

        const button = new MagicButton().element;
        select.parentNode.appendChild(button);

        const onClick = data => {
            let option = this.options[data];//.sign

            // Try to find similar options in case 
            // the text of the question has changed
            if (!option) {
                const candidate = Strings.findSimilar(data, Object.keys(this.options));//.sign
                if (!candidate)
                    return;
                option = this.options[candidate];
            }
            select.value = option;
        };

        return {onClick, button};
    }
}

export default Match;