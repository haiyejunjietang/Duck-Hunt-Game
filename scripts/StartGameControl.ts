
const { ccclass, property } = cc._decorator;

@ccclass
export default class startGameControl extends cc.Component {

    startGame() {
        cc.director.loadScene("game");
    }
}
