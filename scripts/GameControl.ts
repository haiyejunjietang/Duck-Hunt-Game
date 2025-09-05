
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameControl extends cc.Component {
    @property(cc.Node)
    dog: cc.Node = null;
    @property(cc.Prefab)
    RoundTip: cc.Prefab = null;
    @property(cc.Prefab)
    RoundOver: cc.Prefab = null;
    @property(cc.Prefab)
    duckPrefab: cc.Prefab = null;
    @property(cc.Node)
    aim: cc.Node = null;
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    txt: cc.Node = null;

    private isGameRunning: boolean = false;
    private currentRound: number = 1;
    private liver: number = 3;
    private roundTargetScore: number = 40;
    onLoad() {
        this.node.on("startGame", this.startGame, this);
        cc.find("Canvas").on(cc.Node.EventType.MOUSE_MOVE, (event) => {
            const screenPos = event.getLocation();
            const localPos = this.aim.parent.convertToNodeSpaceAR(screenPos);
            this.aim.setPosition(localPos);
        });
    }

    start() {
        this.txt.active = false;   
        this.aim.active = false;
        this.currentRound = 1;

    }

    startGame() {
        cc.log(`开始第${this.currentRound}回合`);
        this.liver = 3;
        this.label.string = "0";
        this.isGameRunning = true;
        this.aim.active = true;
        this.showRoundTip(() => {
            this.scheduleOnce(this.spawnDuck, 2);
        });
    }
    showRoundOver() {
        const tip = cc.instantiate(this.RoundOver);
        cc.find("Canvas").addChild(tip);
        const tipText = tip.getChildByName("jieshu");
        tipText.getComponent(cc.Label).string = "you won! "
        tip.setScale(0.5);
        tip.opacity = 0;
        cc.tween(tip)
            .to(0.5, { opacity: 255, scale: 1.5 }, { easing: "cubicOut" })
            .delay(1)
            .to(0.5, { opacity: 0, scale: 0.5 }, { easing: "cubicIn" })
            .call(() => {
                tip.destroy();
                cc.log("提示框已销毁");
            })
            .start();
    }
    showRoundTip(callback?: Function) {
        const tip = cc.instantiate(this.RoundTip);
        cc.find("Canvas").addChild(tip);
        const tipText = tip.getChildByName("kaishi");
        tipText.getComponent(cc.Label).string = "ROUND " + this.currentRound;
        tip.setScale(0.5);
        tip.opacity = 0;
        cc.tween(tip)
            .to(0.5, { opacity: 255, scale: 1.5 }, { easing: "cubicOut" })
            .delay(1)
            .to(0.5, { opacity: 0, scale: 0.5 }, { easing: "cubicIn" })
            .call(() => {
                tip.destroy();
                cc.log("提示框已销毁");
                if (callback) {
                    callback();
                    cc.log("提示框回调执行，开始调度生成鸭子");
                }
            })
            .start();


    }
    spawnDuck() {

        cc.log("开始生成鸭子");
        this.schedule(() => {
            if (!this.isGameRunning) return;  // 游戏未运行时停止生成
            const duck = cc.instantiate(this.duckPrefab);
            duck.setPosition(-cc.winSize.width / 2, Math.random() * 500 - 200);
            this.node.parent.addChild(duck);
            duck.getComponent("DuckControl").fly();
        }, 2);
    }
    addscore(score: number) {
        if (!this.isGameRunning) return;  // 游戏未运行时不处理分数
        const currentScore = Number(this.label.string) + score;
        this.label.string = currentScore.toString();
        cc.log(`当前分数：${currentScore}`);
        if(Number(this.label.string )%20==0){
            cc.log(Number(this.label.string ));
           cc.find("Canvas/Dog").getComponent("DogControl").caughtDuck();
        }
        if (currentScore >= this.roundTargetScore) {
            this.endCurrentRound();
        }
    }
    private endCurrentRound() {
        this.unscheduleAllCallbacks();  // 停止生成新鸭子
        this.scheduleOnce(() => {
            this.clearAllDucks();
            this.showRoundOver();
        }, 2);

        this.scheduleOnce(() => {
            this.nextRound();
            cc.log(`已通过第${this.currentRound}关`);
        }, 4);
    }
    clearAllDucks() {
        const parentNode = this.node.parent;
        if (!parentNode) return;
        const duckComponents = parentNode.getComponentsInChildren("DuckControl");
        duckComponents.forEach(duck => {
            if (duck && duck.node && !duck.node.destroyed) {
                duck.node.stopAllActions(); // 停止鸭子的所有动作（飞行、动画等）
                duck.node.destroy();
            }
        });
    }
    loseLife() {
        this.liver--;
        cc.log("生命值：" + this.liver);
        if (this.liver <= 0) {
            this.GameOver();
        }
    }
    nextRound() {
        this.currentRound++;
        this.roundTargetScore += 20;
        this.startGame();
    }

    GameOver() {
        cc.log("游戏结束");
         this.txt.active = true;
        cc.tween(this.txt)
        .to(2, { scale: 3 }, { easing: "cubicOut" })
        .delay(1)
        .start();
        this.isGameRunning = false;
        this.aim.active = false;  // 隐藏瞄准镜
        this.unscheduleAllCallbacks();  // 停止所有调度
        this.clearAllDucks();  // 清理鸭子
        this.label.string = "0";  // 清空分数
        this.scheduleOnce(() => {
          cc.director.loadScene("start");  // 回到开始场景
        }, 4);
       
    }
}
