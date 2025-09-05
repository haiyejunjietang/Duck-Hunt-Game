
const { ccclass, property } = cc._decorator;

@ccclass
export default class DuckControl extends cc.Component {
    
    @property
    flySpeed: number = 150;
   
    
    onLoad() { 
     
      this.node.on(cc.Node.EventType.TOUCH_END, this.onDuckClicked, this);
    }

    fly() {
      const move=cc.moveTo(5,cc.winSize.width/2,this.node.y)
      const die=cc.callFunc(()=>{
         cc.find("Canvas/GameManager").getComponent("GameControl").loseLife();
      cc.find("Canvas/Dog").getComponent("DogControl").laugh();
        this.node.destroy();
      })
      this.node.runAction(cc.sequence(move,die));
    }

    onDuckClicked(event: cc.Event.EventTouch) {
        const ani = this.node.getComponent(cc.Animation);
       this.node.stopAllActions();
        ani.play("duckdown");
         cc.find("Canvas/GameManager").getComponent("GameControl").addscore(10);
        cc.tween(this.node)
        .to(0.5,{x:this.node.x,y:-500})
         .call(() => {
       
        this.node.destroy(); 
        })
        .start();
    }
    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onDuckClicked, this);
    }
}
