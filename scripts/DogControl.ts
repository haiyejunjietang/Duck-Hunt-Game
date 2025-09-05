
const { ccclass, property } = cc._decorator;

@ccclass
export default class DogControl extends cc.Component {
 @property(cc.Node)
    gameManagerNode: cc.Node = null;

 private isPouncing: boolean = false;

    update(dt) {
        if(this.isPouncing==false){
             this.node.x += 150 * dt;
              if (this.node.x >= 0) {
            this.pounce();
        }
        }
       
       
    }
    pounce() {
        this.isPouncing = true;
        const ani = this.node.getComponent(cc.Animation);
        ani.stop("dogwalk");
        ani.play("pounce");
       ani.once("finished", () => {
            const fadeOut = cc.fadeOut(0.5);
            const callback = cc.callFunc(() => {
                   cc.log("动画完成，游戏启动");
                // 发送事件通知游戏控制器启动游戏
               this.gameManagerNode.emit("startGame");
                // 隐藏狗节点（可选）
                this.node.active = false;
            });
            this.node.runAction(cc.sequence(fadeOut, callback));
       });
    }
    laugh() {
        this.node.active = true;
        this.node.opacity = 255;
        const ani = this.node.getComponent(cc.Animation);
        ani.play("laugh");
        this.scheduleOnce(() => {
            ani.stop("laugh");
             this.node.active = false;
        },2);
    }

     caughtDuck() {
        this.node.active = true;
        this.node.opacity = 255;
        const ani = this.node.getComponent(cc.Animation);
        ani.play("caughtDuck");
        this.scheduleOnce(() => {
            ani.stop("caughtDuck");
             this.node.active = false;
        },2);
     }
}
