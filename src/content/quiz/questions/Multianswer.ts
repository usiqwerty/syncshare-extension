import Question from "../../../content/quiz/questions/Question";
import * as Images from "../../../shared/utils/images";
import * as Strings from "../../../shared/utils/strings";
import MagicButton from "../../../shared/widgets/MagicButton";

class Multianswer extends Question {
    questionType: string;
    container: any;
    private multichoice: {};
    private edit: {};
    private select: {};

    constructor(args) {
        super(args);

        this.questionType = "multianswer";
        const edits        = this.container.querySelectorAll("span.subquestion > input");
        const selects      = this.container.querySelectorAll("span.subquestion > select");
        const multichoices = this.container.querySelectorAll("div.answer, table.answer, fieldset.answer");

        const getSlot = node => node.name.match(/sub(\d+)/)[1];

        this.edit        = {};
        this.select      = {};
        this.multichoice = {};    

        /* Shortanswer & numerical subquestion type */
        for (const input of edits) {
            this.edit[getSlot(input)] = { input };
        }

        /* Multichoice subquestion type */
        for (const mc of multichoices) {
            const inputs = mc.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

            const subQ = {
                options: {},
                answer: mc,
                type: inputs[0].type,
            }

            for (const input of inputs) {
                const label = input.nextSibling;

                const sign = [
                    Strings.removeInvisible(label.lastChild.textContent) || "[NO TEXT]",
                    Images.serializeArray(label.querySelectorAll("img"))
                ];                  
    
                subQ.options[sign.join(";")] = input;
            }

            this.multichoice[getSlot(inputs[0])] = subQ;
        }

        /* Gap select subquestion type */
        for (const select of selects) {
            const subQ = {
                node: select,
                optionMap: {}
            }

            for (const option of select.childNodes) {
                if (!option.value)
                    continue;

                subQ.optionMap[option.innerText] = option.value;
            }

            this.select[getSlot(select)] = subQ;
        }
    }

    createWidgetAnchor(anchor) {
        let subq = null;
        if ((subq = this.select[anchor.index])) {

            const button = new MagicButton().element;
            subq.node.parentNode.appendChild(button);

            /** @param {string} data */
            const onClick = (data) => {
                let option = subq.optionMap[data];

                // Try to find similar options in case 
                // the text of the question has changed
                if (!option) {
                    const candidate = Strings.findSimilar(data, Object.keys(subq.optionMap));
    
                    if (!candidate) {
                        return;
                    }
    
                    option = subq.optionMap[candidate];
                }

                subq.node.value = option;
            }

            return { onClick, button };
        }
        else if ((subq = this.multichoice[anchor.index])) {

            if ("radio" === subq.type) {

                const button = new MagicButton().element;
                subq.answer.appendChild(button);


                const onClick = (data) => {
                    const ans_anchor = data.anchor[0];
                    let choice = subq.options[ans_anchor];

                    // Try to find similar nodes in case 
                    // the text of the question has changed
                    if (!choice) {
                        const candidate = Strings.findSimilar(ans_anchor, Object.keys(subq.options));

                        if (!candidate) {
                            return;
                        }

                        choice = subq.options[candidate];
                    }
    
                    choice.checked = true;
                }

                return { onClick, button };
            }
            
            if ("checkbox" === subq.type) {
                let choice = subq.options[anchor.index];

                // Try to find similar nodes in case 
                // the text of the question has changed
                if (!choice) {
                    const candiate = Strings.findSimilar(anchor.index, Object.keys(subq.options));

                    // if (!candiate) {
                    //     return;
                    // }

                    choice = subq.options[candiate];
                }
    
                const button = new MagicButton().element;
                choice.parentNode.insertBefore(button, choice.nextSibling);
                /** @param {boolean} data */
                const onClick = data => choice.checked = data;
    
                return { onClick, button };
            }

        }
        else if ((subq = this.edit[anchor.index])) {
            const button = new MagicButton().element;
            subq.input.parentNode.appendChild(button);

            /** @param {string} data */
            const onClick = (data) => {
                subq.input.value = data;
            }

            return { onClick, button };
        }
    }
}

export default Multianswer;