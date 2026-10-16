(function(root){'use strict';
class MalEngine{
 constructor(questions,state=null){this.questions=questions;this.s=state;}
 shuffle(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 create(names,config){const pool=this.questions.filter(q=>config.category==='Todas'||q.category===config.category).map(q=>q.id);if(names.length<2||!pool.length)throw Error('Agrega al menos dos participantes y una categoría disponible.');this.s={version:1,config:{...config},players:names.map(name=>({name,score:0})),pool,deck:this.shuffle(pool),cursor:0,turn:0,phase:'ready',stage:'reading',remaining:config.seconds*1000,questionRemaining:3000,deadline:null,questionDeadline:null,events:[],history:[]};return this.s;}
 get question(){return this.questions.find(q=>q.id===this.s.deck[this.s.cursor]);}
 get player(){return this.s.players[this.s.turn%this.s.players.length];}
 get round(){return Math.floor(this.s.turn/this.s.players.length)+1;}
 get turnScore(){return this.s.events.reduce((sum,e)=>sum+e.points,0);}
 start(now=Date.now()){if(this.s.phase!=='ready')return false;this.s.phase='running';this.s.stage='reading';this.s.remaining=this.s.config.seconds*1000;this.s.deadline=now+this.s.remaining;this.s.events=[];return true;}
 tick(now=Date.now()){if(this.s.phase!=='running')return null;this.s.remaining=Math.max(0,this.s.deadline-now);if(!this.s.remaining){this.finish();return 'turn';}if(this.s.stage==='answering'){this.s.questionRemaining=Math.max(0,this.s.questionDeadline-now);if(!this.s.questionRemaining){this.record('timeout',0);return 'question';}}return null;}
 listen(now=Date.now()){if(this.s.phase!=='running'||this.tick(now)||this.s.stage!=='reading')return false;this.s.stage='answering';this.s.questionRemaining=3000;this.s.questionDeadline=now+3000;return true;}
 answer(isWrong,now=Date.now()){if(this.s.phase!=='running'||this.tick(now)||this.s.stage!=='answering')return false;this.record(isWrong?'wrong':'truth',isWrong?1:0);return true;}
 skip(now=Date.now()){if(this.s.phase!=='running'||this.tick(now))return false;this.record('skip',0);return true;}
 record(reason,points){this.s.events.push({id:this.question.id,question:this.question.question,reason,points});this.player.score+=points;const previous=this.question.id;this.s.cursor++;if(this.s.cursor>=this.s.deck.length){this.s.cursor=0;this.s.deck=this.shuffle(this.s.pool);if(this.s.deck.length>1&&this.s.deck[0]===previous)[this.s.deck[0],this.s.deck[1]]=[this.s.deck[1],this.s.deck[0]];}this.s.stage='reading';this.s.questionRemaining=3000;this.s.questionDeadline=null;}
 pause(now=Date.now()){if(this.s.phase!=='running')return false;this.tick(now);if(this.s.phase!=='running')return false;this.s.phase='paused';this.s.deadline=null;this.s.questionDeadline=null;return true;}
 resume(now=Date.now()){if(this.s.phase!=='paused')return false;this.s.phase='running';this.s.deadline=now+this.s.remaining;this.s.questionDeadline=this.s.stage==='answering'?now+this.s.questionRemaining:null;return true;}
 finish(){if(this.s.phase!=='running')return;this.s.history.push({player:this.player.name,round:this.round,points:this.turnScore,events:[...this.s.events]});this.s.phase='result';this.s.deadline=null;this.s.questionDeadline=null;}
 next(){if(this.s.phase!=='result')return false;this.s.turn++;this.s.phase=this.s.turn>=this.s.players.length*this.s.config.rounds?'over':'ready';this.s.stage='reading';this.s.events=[];return true;}
}
root.MalEngine=MalEngine;if(typeof module!=='undefined')module.exports=MalEngine;
})(globalThis);
